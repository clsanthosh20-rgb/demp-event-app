import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsService } from '../modules/events/events.service.js';
import { prisma } from '../lib/prisma.js';

vi.mock('../lib/prisma.js', () => {
  const mocks = {
    event: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    registration: { findMany: vi.fn() },
    $transaction: vi.fn((cb: any) => cb()),
  };
  return { prisma: mocks };
});

beforeEach(() => vi.clearAllMocks());

describe('eventsService.list', () => {
  it('returns paginated events', async () => {
    vi.mocked(prisma.event.count).mockResolvedValue(1);
    vi.mocked(prisma.event.findMany).mockResolvedValue([
      { id: '1', title: 'Test', date: new Date(), location: 'Rm 1', capacity: 30, category: 'TECH', status: 'OPEN', description: '', createdById: 'u1', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await eventsService.list({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});

describe('eventsService.create', () => {
  it('creates an event', async () => {
    vi.mocked(prisma.event.create).mockResolvedValue({
      id: 'new', title: 'New Event', description: 'Desc', date: new Date(), location: 'Hall', capacity: 50, category: 'WORKSHOP', status: 'DRAFT', imageUrl: null, createdById: 'u1', createdAt: new Date(), updatedAt: new Date(),
    });

    const event = await eventsService.create({
      title: 'New Event', description: 'Desc', date: new Date().toISOString(), location: 'Hall', capacity: 50, category: 'WORKSHOP', status: 'DRAFT', createdById: 'u1',
    });
    expect(event.id).toBe('new');
    expect(event.title).toBe('New Event');
  });
});
