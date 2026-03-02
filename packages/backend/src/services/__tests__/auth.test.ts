import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../auth.js';
import * as userRepo from '../../repositories/user.js';

vi.mock('../../repositories/user.js');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = authService.generateToken('test-user-id');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = 'test-user-id';
      const token = authService.generateToken(userId);
      const payload = authService.verifyToken(token);
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(userId);
    });

    it('should return null for invalid token', () => {
      const payload = authService.verifyToken('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('signup', () => {
    it('should throw error if user already exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hash',
        name: 'Test User',
        created_at: new Date().toISOString(),
      };

      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.signup('test@example.com', 'password', 'Test User')
      ).rejects.toThrow('User already exists');
    });

    it('should create a new user and return token', async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null);

      const mockUser = {
        id: '1',
        email: 'new@example.com',
        password_hash: 'hash',
        name: 'New User',
        created_at: new Date().toISOString(),
      };

      vi.mocked(userRepo.createUser).mockResolvedValue(mockUser);

      const result = await authService.signup(
        'new@example.com',
        'password',
        'New User'
      );

      expect(result.user.email).toBe('new@example.com');
      expect(result.token).toBeTruthy();
    });
  });
});
