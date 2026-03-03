import { Router, Response, Router as ExpressRouter } from 'express';
import { signup, login, blacklistToken, requestPasswordReset, confirmPasswordReset } from '../services/auth.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router: ReturnType<typeof Router> = Router();

router.post('/signup', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await signup(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    console.error('Signup error:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('Error type:', typeof error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    res.status(400).json({ error: message || 'An error occurred during signup' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await login(email, password);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ error: message });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.jti) {
      res.status(400).json({ error: 'Invalid token' });
      return;
    }

    await blacklistToken(req.jti);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.post('/request-reset', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    const resetToken = await requestPasswordReset(email);
    // In production, send email with reset link
    // For MVP, we return the token (for testing purposes)
    res.status(200).json({ 
      message: 'If an account exists for this email, a reset link will be sent.',
      resetToken: resetToken // Remove this in production!
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.post('/confirm-reset', async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Missing token or password' });
      return;
    }

    await confirmPasswordReset(token, newPassword);
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully. Please login with your new password.' 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('Invalid or expired') ? 400 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
