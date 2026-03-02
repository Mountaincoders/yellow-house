import { Router, Response } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import * as groupService from '../services/group.js';
import * as availService from '../services/availability.js';

const router: ReturnType<typeof Router> = Router();

// Create group
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !req.userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const group = await groupService.createGroup(name, req.userId);
    res.status(201).json(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Get user's groups
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(400).json({ error: 'Missing user ID' });
      return;
    }

    const groups = await groupService.getUserGroups(req.userId);
    res.status(200).json(groups);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Get group details
router.get('/:groupId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const group = await groupService.getGroup(groupId);
    res.status(200).json(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json({ error: message });
  }
});

// Join group
router.post('/:groupId/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!req.userId) {
      res.status(400).json({ error: 'Missing user ID' });
      return;
    }

    await groupService.joinGroup(groupId, req.userId);
    res.status(200).json({ message: 'Successfully joined group' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Get group members
router.get('/:groupId/members', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const members = await groupService.getGroupMembers(groupId);
    res.status(200).json(members);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Remove group member
router.delete('/:groupId/members/:memberId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    if (!req.userId) {
      res.status(400).json({ error: 'Missing user ID' });
      return;
    }

    await groupService.removeGroupMember(groupId, memberId, req.userId);
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('not found') || message.includes('Only group owner') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// Mark availability
router.post(
  '/:groupId/availability',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { groupId } = req.params;
      const { time_slot, marked } = req.body;

      if (!req.userId || !time_slot || marked === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const slot = await availService.markAvailability(
        req.userId,
        groupId,
        time_slot,
        marked
      );
      res.status(201).json(slot);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// Bulk mark availability
router.post(
  '/:groupId/availability/bulk',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { groupId } = req.params;
      const { time_slots, marked } = req.body;

      if (!req.userId || !Array.isArray(time_slots) || marked === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const slots = await availService.bulkMarkAvailability(
        req.userId,
        groupId,
        time_slots,
        marked
      );
      res.status(201).json(slots);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// Get group availability
router.get(
  '/:groupId/availability',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { groupId } = req.params;
      const availability = await availService.getGroupAvailability(groupId);
      res.status(200).json(availability);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// Get overlaps
router.get('/:groupId/overlaps', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const overlaps = await availService.getOverlaps(groupId);
    res.status(200).json(overlaps);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Edit availability slot
router.put(
  '/:groupId/availability/:slotId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { groupId, slotId } = req.params;
      const { time_slot } = req.body;

      if (!req.userId || !time_slot) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const updatedSlot = await availService.editAvailabilitySlot(
        slotId,
        req.userId,
        groupId,
        time_slot
      );
      res.status(200).json(updatedSlot);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// Delete availability slot
router.delete(
  '/:groupId/availability/:slotId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { groupId, slotId } = req.params;

      if (!req.userId) {
        res.status(400).json({ error: 'Missing user ID' });
        return;
      }

      await availService.deleteAvailabilitySlot(slotId, req.userId, groupId);
      res.status(200).json({ message: 'Availability slot deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

export default router;
