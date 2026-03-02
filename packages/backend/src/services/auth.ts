import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../repositories/user.js';
import type { User } from '@yellow-house/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
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

  const token = generateToken(user.id);

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

  const token = generateToken(user.id);

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
