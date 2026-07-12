import type { Request, Response } from 'express';
import { eventQuerySchema, createEventSchema, updateEventSchema, bulkStatusSchema } from '@demp/shared';
import { eventsService } from './events.service.js';

async function list(req: Request, res: Response) {
  const parsed = eventQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const result = await eventsService.list(parsed.data);
  res.json(result);
}

async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const event = await eventsService.getById(id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json(event);
}

async function create(req: Request, res: Response) {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const event = await eventsService.create({ ...parsed.data, createdById: req.userId! });
  res.status(201).json(event);
}

async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const event = await eventsService.update(id, parsed.data);
  res.json(event);
}

async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await eventsService.remove(id);
  res.status(204).end();
}

async function clone(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const event = await eventsService.clone(id, req.userId!);
    res.status(201).json(event);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Clone failed' });
  }
}

async function getRegistrations(req: Request, res: Response) {
  const id = req.params.id as string;
  const registrations = await eventsService.getRegistrations(id);
  res.json(registrations);
}

async function bulkUpdateStatus(req: Request, res: Response) {
  const parsed = bulkStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  await eventsService.bulkUpdateStatus(parsed.data.ids, parsed.data.status);
  res.status(204).end();
}

export const eventsController = { list, getById, create, update, remove, clone, getRegistrations, bulkUpdateStatus };
