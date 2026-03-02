import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as groupRepo from '../group.js';
import * as db from '../../db.js';

vi.mock('../../db.js');

describe('Group Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a new group', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockGroup],
      } as any);

      const result = await groupRepo.createGroup('Test Group', 'user-1');

      expect(result).toEqual(mockGroup);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO groups'),
        ['Test Group', 'user-1']
      );
    });
  });

  describe('findGroupById', () => {
    it('should find a group by ID', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockGroup],
      } as any);

      const result = await groupRepo.findGroupById('group-1');

      expect(result).toEqual(mockGroup);
    });

    it('should return null if group not found', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
      } as any);

      const result = await groupRepo.findGroupById('non-existent');

      expect(result).toBeNull();
    });
  });
});
