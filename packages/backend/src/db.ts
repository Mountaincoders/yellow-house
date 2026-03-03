import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL || 'postgresql://com_yellowhouse_app_user:z8Ez8jiRgRiUjsa2ZAPRwEVbbT2MxlpE@dpg-d6jcobrh46gs739f39jg-a/com_yellowhouse_app';

console.log('📌 DB Connection:', dbUrl.substring(0, 60) + '...');

const pool = new Pool({
  connectionString: dbUrl,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Database query error', { text, err });
    throw err;
  }
}

export async function getClient() {
  return pool.connect();
}

export async function closePool() {
  await pool.end();
}
