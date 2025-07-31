import { db } from '../config/database.js';

export const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    up: async () => {
      console.log('Running migration: initial_schema');

      // Create users table
      await db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
          department TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create routes table
      await db.run(`
        CREATE TABLE IF NOT EXISTS routes (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create stations table
      await db.run(`
        CREATE TABLE IF NOT EXISTS stations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          owner TEXT NOT NULL,
          completion_rule TEXT NOT NULL CHECK (completion_rule IN ('all_filled', 'custom')),
          estimated_duration INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create route_stations junction table
      await db.run(`
        CREATE TABLE IF NOT EXISTS route_stations (
          id TEXT PRIMARY KEY,
          route_id TEXT NOT NULL,
          station_id TEXT NOT NULL,
          sequence_order INTEGER NOT NULL,
          is_required BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE,
          FOREIGN KEY (station_id) REFERENCES stations (id) ON DELETE CASCADE,
          UNIQUE (route_id, station_id),
          UNIQUE (route_id, sequence_order)
        )
      `);

      // Create fields table
      await db.run(`
        CREATE TABLE IF NOT EXISTS fields (
          id TEXT PRIMARY KEY,
          station_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'select', 'checkbox', 'textarea')),
          is_required BOOLEAN DEFAULT 0,
          options TEXT, -- JSON string for select options
          default_value TEXT,
          validation_rules TEXT, -- JSON string for validation rules
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (station_id) REFERENCES stations (id) ON DELETE CASCADE
        )
      `);

      // Create products table
      await db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          model TEXT NOT NULL,
          route_id TEXT NOT NULL,
          current_station_id TEXT,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'overdue')),
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          estimated_completion DATETIME,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (route_id) REFERENCES routes (id),
          FOREIGN KEY (current_station_id) REFERENCES stations (id),
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create station_history table
      await db.run(`
        CREATE TABLE IF NOT EXISTS station_history (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          station_id TEXT NOT NULL,
          station_name TEXT NOT NULL,
          owner TEXT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
          notes TEXT,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
          FOREIGN KEY (station_id) REFERENCES stations (id),
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create field_data table
      await db.run(`
        CREATE TABLE IF NOT EXISTS field_data (
          id TEXT PRIMARY KEY,
          station_history_id TEXT NOT NULL,
          field_id TEXT NOT NULL,
          field_name TEXT NOT NULL,
          value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (station_history_id) REFERENCES station_history (id) ON DELETE CASCADE,
          FOREIGN KEY (field_id) REFERENCES fields (id)
        )
      `);

      // Create audit_log table
      await db.run(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id TEXT PRIMARY KEY,
          table_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
          old_values TEXT, -- JSON string
          new_values TEXT, -- JSON string
          changed_by TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (changed_by) REFERENCES users (id)
        )
      `);

      console.log('✅ Initial schema created successfully');
    },
    down: async () => {
      console.log('Rolling back migration: initial_schema');
      
      const tables = [
        'audit_log',
        'field_data',
        'station_history',
        'products',
        'fields',
        'route_stations',
        'stations',
        'routes',
        'users'
      ];

      for (const table of tables) {
        await db.run(`DROP TABLE IF EXISTS ${table}`);
      }

      console.log('✅ Initial schema rolled back successfully');
    }
  },
  {
    version: 2,
    name: 'create_indexes',
    up: async () => {
      console.log('Running migration: create_indexes');

      // Index for users
      await db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)');

      // Indexes for products
      await db.run('CREATE INDEX IF NOT EXISTS idx_products_route_id ON products (route_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_products_current_station ON products (current_station_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_products_status ON products (status)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products (updated_at)');

      // Indexes for station_history
      await db.run('CREATE INDEX IF NOT EXISTS idx_station_history_product_id ON station_history (product_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_station_history_station_id ON station_history (station_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_station_history_status ON station_history (status)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_station_history_start_time ON station_history (start_time)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_station_history_owner ON station_history (owner)');

      // Indexes for route_stations
      await db.run('CREATE INDEX IF NOT EXISTS idx_route_stations_route_id ON route_stations (route_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_route_stations_station_id ON route_stations (station_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_route_stations_sequence ON route_stations (route_id, sequence_order)');

      // Indexes for fields
      await db.run('CREATE INDEX IF NOT EXISTS idx_fields_station_id ON fields (station_id)');

      // Indexes for field_data
      await db.run('CREATE INDEX IF NOT EXISTS idx_field_data_station_history_id ON field_data (station_history_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_field_data_field_id ON field_data (field_id)');

      // Indexes for audit_log
      await db.run('CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log (table_name, record_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log (changed_by)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at)');

      console.log('✅ Indexes created successfully');
    },
    down: async () => {
      console.log('Rolling back migration: create_indexes');
      
      const indexes = [
        'idx_users_username',
        'idx_users_email',
        'idx_users_role',
        'idx_products_route_id',
        'idx_products_current_station',
        'idx_products_status',
        'idx_products_created_at',
        'idx_products_updated_at',
        'idx_station_history_product_id',
        'idx_station_history_station_id',
        'idx_station_history_status',
        'idx_station_history_start_time',
        'idx_station_history_owner',
        'idx_route_stations_route_id',
        'idx_route_stations_station_id',
        'idx_route_stations_sequence',
        'idx_fields_station_id',
        'idx_field_data_station_history_id',
        'idx_field_data_field_id',
        'idx_audit_log_table_record',
        'idx_audit_log_changed_by',
        'idx_audit_log_created_at'
      ];

      for (const index of indexes) {
        await db.run(`DROP INDEX IF EXISTS ${index}`);
      }

      console.log('✅ Indexes dropped successfully');
    }
  },
  {
    version: 3,
    name: 'add_form_data_to_station_history',
    up: async () => {
      console.log('Running migration: add_form_data_to_station_history');

      // Add form_data column to station_history table
      await db.run(`
        ALTER TABLE station_history ADD COLUMN form_data TEXT DEFAULT '{}'
      `);

      console.log('✅ Added form_data column to station_history table');
    },
    down: async () => {
      console.log('Rolling back migration: add_form_data_to_station_history');
      
      // SQLite doesn't support DROP COLUMN, so we need to recreate the table
      await db.run(`
        CREATE TABLE station_history_backup AS 
        SELECT id, product_id, station_id, station_name, owner, start_time, end_time, status, notes, created_by, created_at
        FROM station_history
      `);
      
      await db.run('DROP TABLE station_history');
      
      await db.run(`
        CREATE TABLE station_history (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          station_id TEXT NOT NULL,
          station_name TEXT NOT NULL,
          owner TEXT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
          notes TEXT,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
          FOREIGN KEY (station_id) REFERENCES stations (id),
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);
      
      await db.run(`
        INSERT INTO station_history 
        SELECT * FROM station_history_backup
      `);
      
      await db.run('DROP TABLE station_history_backup');

      console.log('✅ Removed form_data column from station_history table');
    }
  }
];

// Migration tracking table
export const createMigrationTable = async () => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const getCurrentVersion = async (): Promise<number> => {
  const result = await db.get<{ version: number }>(`
    SELECT MAX(version) as version FROM migrations
  `);
  return result?.version || 0;
};

export const recordMigration = async (version: number, name: string) => {
  await db.run(`
    INSERT INTO migrations (version, name) VALUES (?, ?)
  `, [version, name]);
};

export const removeMigrationRecord = async (version: number) => {
  await db.run(`DELETE FROM migrations WHERE version = ?`, [version]);
};