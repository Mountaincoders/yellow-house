import { query } from '../db.js';
import type { UserRow } from '../models/index.js';

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string
): Promise<UserRow> {
  try {
    console.log('🔄 Inserting user:', { email, name });
    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, passwordHash, name]
    );
    console.log('✓ Insert successful, rows:', result.rows.length);
    return result.rows[0];
  } catch (error) {
    console.error('✗ Insert failed:', error);
    throw error;
  }
}

export async function updateUser(
  id: string,
  updates: { name?: string }
): Promise<UserRow> {
  const { name } = updates;
  const result = await query(
    'UPDATE users SET name = COALESCE($1, name) WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
}
