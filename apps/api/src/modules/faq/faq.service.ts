import { prisma } from '../../lib/prisma.js';
import type { CreateFaqInput, UpdateFaqInput } from '@demp/shared';

async function list() {
  return prisma.fAQ.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  }) as any;
}

async function search(query: string) {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const all = (await prisma.fAQ.findMany({
    where: { isActive: true },
  })) as any[];

  const scored = all.map((faq: any) => {
    const text = `${faq.question} ${faq.answer}`.toLowerCase();
    const score = keywords.filter((k) => text.includes(k)).length;
    return { faq, score };
  });

  const best = scored.filter((s: any) => s.score > 0).sort((a: any, b: any) => b.score - a.score);
  return best.slice(0, 3).map((s: any) => s.faq);
}

async function getById(id: string) {
  return prisma.fAQ.findUnique({ where: { id } }) as any;
}

async function create(data: CreateFaqInput) {
  return prisma.fAQ.create({ ...data, isActive: true }) as any;
}

async function update(id: string, data: UpdateFaqInput) {
  return prisma.fAQ.update({ where: { id }, data }) as any;
}

async function remove(id: string) {
  await prisma.fAQ.delete({ where: { id } });
}

export const faqService = { list, search, getById, create, update, remove };
