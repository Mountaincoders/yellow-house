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
  const result = await query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, name]
  );
  return result.rows[0];
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
