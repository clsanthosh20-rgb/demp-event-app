import { prisma } from '../../lib/prisma.js';
import type { CreateRuleInput, UpdateRuleInput } from '@demp/shared';

async function list() {
  const rules = await prisma.rule.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
  return rules as any;
}

async function listAll() {
  const rules = await prisma.rule.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
  return rules as any;
}

async function getById(id: string) {
  return prisma.rule.findUnique({ where: { id } }) as any;
}

async function create(data: CreateRuleInput) {
  return prisma.rule.create(data) as any;
}

async function update(id: string, data: UpdateRuleInput) {
  return prisma.rule.update({ where: { id }, data }) as any;
}

async function remove(id: string) {
  await prisma.rule.delete({ where: { id } });
}

export const rulesService = { list, listAll, getById, create, update, remove };
