import { Router, Response, Router as ExpressRouter } from 'express';
import { signup, login } from '../services/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

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
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
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

export default router;
