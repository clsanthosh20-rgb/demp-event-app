import type { Request, Response } from 'express';
import { createFaqSchema, updateFaqSchema } from '@demp/shared';
import { faqService } from './faq.service.js';

async function list(_req: Request, res: Response) {
  const faqs = await faqService.list();
  res.json(faqs);
}

async function search(req: Request, res: Response) {
  const q = (req.query.q as string) || '';
  if (!q.trim()) { res.json([]); return; }
  const results = await faqService.search(q);
  res.json(results);
}

async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const faq = await faqService.getById(id);
  if (!faq) { res.status(404).json({ error: 'FAQ not found' }); return; }
  res.json(faq);
}

async function create(req: Request, res: Response) {
  const parsed = createFaqSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten().fieldErrors }); return; }
  const faq = await faqService.create(parsed.data);
  res.status(201).json(faq);
}

async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateFaqSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten().fieldErrors }); return; }
  const faq = await faqService.update(id, parsed.data);
  res.json(faq);
}

async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await faqService.remove(id);
  res.status(204).end();
}

export const faqController = { list, search, getById, create, update, remove };
