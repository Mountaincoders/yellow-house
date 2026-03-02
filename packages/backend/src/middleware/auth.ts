import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.js';

export interface AuthRequest extends Request {
  userId?: string;
  jti?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  // Handle async verification
  verifyToken(token)
    .then((payload) => {
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      req.userId = payload.userId;
      req.jti = payload.jti;
      next();
    })
    .catch((error) => {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Invalid token' });
    });
}
