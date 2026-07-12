import type { Request, Response } from 'express';
import { createRuleSchema, updateRuleSchema } from '@demp/shared';
import { rulesService } from './rules.service.js';

async function list(_req: Request, res: Response) {
  const rules = await rulesService.list();
  res.json(rules);
}

async function listAll(_req: Request, res: Response) {
  const rules = await rulesService.listAll();
  res.json(rules);
}

async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const rule = await rulesService.getById(id);
  if (!rule) { res.status(404).json({ error: 'Rule not found' }); return; }
  res.json(rule);
}

async function create(req: Request, res: Response) {
  const parsed = createRuleSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten().fieldErrors }); return; }
  const rule = await rulesService.create(parsed.data);
  res.status(201).json(rule);
}

async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateRuleSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten().fieldErrors }); return; }
  const rule = await rulesService.update(id, parsed.data);
  res.json(rule);
}

async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await rulesService.remove(id);
  res.status(204).end();
}

export const rulesController = { list, listAll, getById, create, update, remove };
