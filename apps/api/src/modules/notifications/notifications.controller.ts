import type { Request, Response } from 'express';
import { notificationService } from './notifications.service.js';

async function list(req: Request, res: Response) {
  const result = await notificationService.list(req.userId!);
  res.json(result);
}

async function markRead(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    await notificationService.markRead(id, req.userId!);
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'Notification not found' });
  }
}

async function markAllRead(req: Request, res: Response) {
  await notificationService.markAllRead(req.userId!);
  res.status(204).end();
}

export const notificationController = { list, markRead, markAllRead };
