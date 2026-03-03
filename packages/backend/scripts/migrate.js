import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/yellow-house';

console.log('🔍 DEBUG: DATABASE_URL =', dbUrl ? dbUrl.substring(0, 50) + '...' : 'NOT SET');
console.log('🔍 DEBUG: NODE_ENV =', process.env.NODE_ENV);
console.log('🔍 DEBUG: All env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NODE')));

async function migrate() {
  const client = new pg.Client(dbUrl);

  try {
    await client.connect();
    console.log('Connected to database');

    const schemaPath = path.join(__dirname, '../database/001-initial-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute statements individually for better error reporting
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (err) {
          // Warn but don't fail on certain expected errors
          if (err.code !== 'DUPLICATE_OBJECT' && !err.message.includes('already exists')) {
            throw err;
          }
          console.warn(`⚠ Warning (non-fatal):`, err.message);
        }
      }
    }
    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
