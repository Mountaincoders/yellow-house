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

export async function requestPasswordReset(email: string): Promise<string> {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not (security best practice)
    return 'If an account exists for this email, a reset link will be sent.';
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  try {
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
      [resetToken, resetExpiresAt, user.id]
    );
    return resetToken;
  } catch (err) {
    console.error('Error generating reset token:', err);
    throw err;
  }
}

export async function confirmPasswordReset(resetToken: string, newPassword: string): Promise<void> {
  // Validate password strength (minimum 8 characters)
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    // Find user with valid reset token
    const result = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
      [resetToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const userId = result.rows[0].id;
    const passwordHash = hashPassword(newPassword);

    // Update password and clear reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [passwordHash, userId]
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid or expired')) {
      throw err;
    }
    console.error('Error resetting password:', err);
    throw err;
  }
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<{ user: User; token: string }> {
  console.log('📝 signup() called:', { email, name });
  
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    console.log('⚠ User already exists:', email);
    throw new Error('User already exists');
  }
  console.log('✓ User does not exist, proceeding');

  const passwordHash = hashPassword(password);
  console.log('✓ Password hashed');
  
  const user = await createUser(email, passwordHash, name);
  console.log('✓ User created:', user.id);

  const { token } = generateToken(user.id);
  console.log('✓ Token generated');

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
