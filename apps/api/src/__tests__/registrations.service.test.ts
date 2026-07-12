import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrationService } from '../modules/registrations/registrations.service.js';
import { prisma } from '../lib/prisma.js';

vi.mock('../lib/prisma.js', () => {
  const mocks = {
    registration: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    event: { findUnique: vi.fn(), update: vi.fn() },
    notification: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn((cb: any) => cb()),
  };
  return { prisma: mocks };
});

beforeEach(() => vi.clearAllMocks());

describe('registrationService.register', () => {
  it('registers a user when capacity available', async () => {
    vi.mocked(prisma.event.findUnique).mockResolvedValue({
      id: 'e1', title: 'E', date: new Date(), capacity: 10, status: 'OPEN',
    } as any);
    vi.mocked(prisma.registration.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.registration.count).mockResolvedValue(5);
    vi.mocked(prisma.registration.create).mockResolvedValue({
      id: 'r1', userId: 'u1', eventId: 'e1', status: 'REGISTERED', registeredAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A' } as any);

    const result = await registrationService.register('e1', 'u1');
    expect(result).toHaveProperty('id');
  });

  it('throws when event is full', async () => {
    vi.mocked(prisma.event.findUnique).mockResolvedValue({
      id: 'e1', title: 'E', capacity: 10, status: 'OPEN',
    } as any);
    vi.mocked(prisma.registration.count).mockResolvedValue(10);

    await expect(registrationService.register('e1', 'u1'))
      .rejects.toThrow('Event is full');
  });
});
