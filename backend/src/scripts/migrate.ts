#!/usr/bin/env node

import { db } from '../config/database.js';
import { 
  migrations, 
  createMigrationTable, 
  getCurrentVersion, 
  recordMigration, 
  removeMigrationRecord 
} from './migrations.js';

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to database
    await db.connect();
    
    // Create migration tracking table
    await createMigrationTable();
    
    // Get current version
    const currentVersion = await getCurrentVersion();
    console.log(`📊 Current database version: ${currentVersion}`);
    
    // Find migrations to run
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Database is up to date. No migrations to run.');
      return;
    }
    
    console.log(`🔧 Running ${pendingMigrations.length} migration(s)...`);
    
    // Run each migration in a transaction
    for (const migration of pendingMigrations) {
      console.log(`🔄 Running migration ${migration.version}: ${migration.name}`);
      
      await db.transaction(async () => {
        await migration.up();
        await recordMigration(migration.version, migration.name);
      });
      
      console.log(`✅ Migration ${migration.version} completed successfully`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
};

const rollbackMigration = async (targetVersion: number) => {
  try {
    console.log(`🔄 Rolling back to version ${targetVersion}...`);
    
    // Connect to database
    await db.connect();
    
    // Create migration tracking table
    await createMigrationTable();
    
    // Get current version
    const currentVersion = await getCurrentVersion();
    console.log(`📊 Current database version: ${currentVersion}`);
    
    if (targetVersion >= currentVersion) {
      console.log('⚠️ Target version is not lower than current version. No rollback needed.');
      return;
    }
    
    // Find migrations to rollback (in reverse order)
    const migrationsToRollback = migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .reverse();
    
    console.log(`🔧 Rolling back ${migrationsToRollback.length} migration(s)...`);
    
    // Rollback each migration in a transaction
    for (const migration of migrationsToRollback) {
      console.log(`🔄 Rolling back migration ${migration.version}: ${migration.name}`);
      
      await db.transaction(async () => {
        await migration.down();
        await removeMigrationRecord(migration.version);
      });
      
      console.log(`✅ Migration ${migration.version} rolled back successfully`);
    }
    
    console.log(`🎉 Rollback to version ${targetVersion} completed successfully!`);
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
};

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'up':
    runMigrations();
    break;
  case 'down':
    const targetVersion = parseInt(args[1]);
    if (isNaN(targetVersion)) {
      console.error('❌ Please provide a target version number for rollback');
      console.log('Usage: npm run migrate down <version>');
      process.exit(1);
    }
    rollbackMigration(targetVersion);
    break;
  case 'status':
    (async () => {
      await db.connect();
      await createMigrationTable();
      const currentVersion = await getCurrentVersion();
      const totalMigrations = migrations.length;
      const latestMigration = migrations[migrations.length - 1];
      
      console.log('📊 Migration Status:');
      console.log(`Current version: ${currentVersion}`);
      console.log(`Latest version: ${latestMigration?.version || 0}`);
      console.log(`Pending migrations: ${Math.max(0, (latestMigration?.version || 0) - currentVersion)}`);
      
      await db.close();
    })();
    break;
  default:
    console.log('🚀 Database Migration Tool');
    console.log('');
    console.log('Commands:');
    console.log('  up     - Run pending migrations');
    console.log('  down   - Rollback to specific version');
    console.log('  status - Show migration status');
    console.log('');
    console.log('Examples:');
    console.log('  npm run migrate up');
    console.log('  npm run migrate down 1');
    console.log('  npm run migrate status');
}