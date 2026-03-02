import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../repositories/user.js';
import { query } from '../db.js';
import type { User } from '@yellow-house/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: string): { token: string; jti: string } {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ userId, jti }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return { token, jti };
}

export async function verifyToken(token: string): Promise<{ userId: string; jti: string } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; jti: string };
    
    // Check if token is blacklisted
    const result = await query(
      'SELECT 1 FROM token_blacklist WHERE jti = $1',
      [decoded.jti]
    );
    
    if (result.rows.length > 0) {
      return null; // Token is blacklisted
    }
    
    return decoded;
  } catch {
    return null;
  }
}

export async function blacklistToken(jti: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  try {
    await query(
      'INSERT INTO token_blacklist (jti, expires_at) VALUES ($1, $2) ON CONFLICT (jti) DO NOTHING',
      [jti, expiresAt]
    );
  } catch (err) {
    console.error('Error blacklisting token:', err);
    throw err;
  }
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<{ user: User; token: string }> {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = hashPassword(password);
  const user = await createUser(email, passwordHash, name);

  const { token } = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    },
    token,
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  if (!verifyPassword(password, user.password_hash)) {
    throw new Error('Invalid password');
  }

  const { token } = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    },
    token,
  };
}
