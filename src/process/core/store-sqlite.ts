import { app } from "electron";
import { existsSync, renameSync, unlinkSync } from "fs";
import path from "path";
import logger from './logger';
import { STORE_DEFAULTS } from "../../types/defaults";
import { CommandBridgeClientStore, loadOrCreateNewStoreIfFail } from "./store";
const Database = require('better-sqlite3');

const DB_NAME = 'config.db';
const dbPath = path.join(app.getPath('userData'), DB_NAME);
let db: any;

function getDb() {
    if (!db) {
        initialize();
    }
    return db;
}

interface ConfigRow {
    key: string;
    value: string;
}

function initializeSQLite() {
    try {
        logger.info('Initializing SQLite database at:', dbPath);

        db = new Database(dbPath);
        db.pragma('journal_mode = DELETE');
        db.pragma('synchronous = FULL');
        db.pragma('locking_mode = EXCLUSIVE');
        db.pragma('secure_delete = ON');
        
        db.exec(`
            CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            ) STRICT
        `);
    } catch (error) {
        logger.error('Failed to initialize SQLite database:', error);

        if (existsSync(dbPath)) {
            unlinkSync(dbPath);
            initializeSQLite(); // Retry
        }
        throw error;
    }
}

function migrateToSQLite() {
    const electronStore = loadOrCreateNewStoreIfFail();
    const allSettings = electronStore.store;

    try {
        const stmt = getDb().prepare(`
            INSERT OR REPLACE INTO config (key, value) 
            VALUES (@key, @value)
        `);
        
        const transaction = getDb().transaction(() => {
            for (const [key, value] of Object.entries(allSettings)) {
                stmt.run({ key, value: JSON.stringify(value) });
            }
            // Archive the old config
            const storePath = path.join(app.getPath('userData'), 'config.json');
            if (existsSync(storePath)) {
                renameSync(storePath, `${storePath}.migrated`);
            }
        });
        
        transaction();
        logger.info('Successfully migrated settings to SQLite');
    } catch (error) {
        logger.error('Migration to SQLite failed:', error);
    }
}

export function initialize() {
    initializeSQLite();
    
    // Check if we need to migrate
    const storePath = path.join(app.getPath('userData'), 'config.json');
    if (existsSync(storePath)) {
        migrateToSQLite();
    } else {
        // Insert defaults if no migration needed
        const insertDefault = getDb().prepare(`
            INSERT OR IGNORE INTO config (key, value)
            VALUES (?, ?)
        `);
        
        getDb().transaction(() => {
            for (const [key, value] of Object.entries(STORE_DEFAULTS)) {
                insertDefault.run(key, JSON.stringify(value));
            }
        })();
    }
}

// Helper functions
export function getValue<T>(key: string): T | undefined {
    const row = getDb().prepare('SELECT value FROM config WHERE key = ?').get(key) as ConfigRow | undefined;
    
    if (!row) return undefined;
    
    try {
        return JSON.parse(row.value) as T;
    } catch (error) {
        logger.error(`Failed to parse value for key ${key}:`, error);
        return undefined;
    }
}

export function setValue(key: string, value: any): void {
    getDb().prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .run(key, JSON.stringify(value));
}

export function getAllSettings(): CommandBridgeClientStore {
    const rows = getDb().prepare('SELECT key, value FROM config').all() as ConfigRow[];
    const result: any = {};
    for (const row of rows) {
        result[row.key] = JSON.parse(row.value);
    }
    return result as CommandBridgeClientStore;
}

export function resetSettings() {
    getDb().exec('DELETE FROM config');
    getDb().transaction(() => {
        for (const [key, value] of Object.entries(STORE_DEFAULTS)) {
            getDb().prepare('INSERT INTO config (key, value) VALUES (?, ?)')
              .run(key, JSON.stringify(value));
        }
    })();
}

export function updateSettings(newSettings: CommandBridgeClientStore) {
    const stmt = getDb().prepare(`
        INSERT OR REPLACE INTO config (key, value) 
        VALUES (@key, @value)
    `);
    
    getDb().transaction(() => {
        for (const [key, value] of Object.entries(newSettings)) {
            stmt.run({ key, value: JSON.stringify(value) });
        }
    })();
}