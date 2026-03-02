import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/yellow-house';

async function migrate() {
  const client = new pg.Client(dbUrl);

  try {
    await client.connect();
    console.log('Connected to database');

    const schemaPath = path.join(__dirname, '../database/001-initial-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await client.query(sql);
    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
