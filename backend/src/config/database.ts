import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;
  private readonly dbPath: string;

  private constructor() {
    this.dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/database.sqlite');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<Database> {
    if (this.db) {
      return this.db;
    }

    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    await fs.mkdir(dataDir, { recursive: true });

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database:', this.dbPath);
          // Enable foreign keys
          this.db!.run('PRAGMA foreign_keys = ON');
          // Enable WAL mode for better concurrency
          this.db!.run('PRAGMA journal_mode = WAL');
          resolve(this.db!);
        }
      });
    });
  }

  public async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  public getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Helper method to run queries with promise support
  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.getDatabase().run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  // Helper method to get single row
  public get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.getDatabase().get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  // Helper method to get all rows
  public all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.getDatabase().all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  // Transaction helper
  public async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    const db = this.getDatabase();
    
    await this.run('BEGIN TRANSACTION');
    
    try {
      const result = await callback(db);
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Backup database
  public async backup(backupPath?: string): Promise<void> {
    if (!backupPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = process.env.DATABASE_BACKUP_PATH || path.join(__dirname, '../../data/backups');
      await fs.mkdir(backupDir, { recursive: true });
      backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);
    }

    return new Promise((resolve, reject) => {
      const backup = this.getDatabase().backup(backupPath!);
      
      backup.step(-1, (err) => {
        if (err) {
          reject(err);
        } else {
          backup.finish((err) => {
            if (err) {
              reject(err);
            } else {
              console.log('Database backup created:', backupPath);
              resolve();
            }
          });
        }
      });
    });
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();