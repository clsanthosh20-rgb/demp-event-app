import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { authService } from '../modules/auth/auth.service.js';
import { prisma } from '../lib/prisma.js';

vi.mock('../lib/prisma.js', () => {
  const mocks = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
  return { prisma: mocks };
});

beforeEach(() => vi.clearAllMocks());

describe('authService.register', () => {
  it('creates a user and returns tokens', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '1', email: 'a@b.com', name: 'A', role: 'STUDENT',
      department: null, avatarUrl: null, passwordHash: 'hash',
      createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await authService.register({ email: 'a@b.com', password: '12345678', name: 'A' });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('throws on duplicate email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1' } as any);
    await expect(authService.register({ email: 'a@b.com', password: '12345678', name: 'A' }))
      .rejects.toThrow('Email already registered');
  });
});

describe('authService.login', () => {
  it('returns tokens for valid credentials', async () => {
    const hash = await bcrypt.hash('12345678', 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1', email: 'a@b.com', name: 'A', role: 'STUDENT',
      passwordHash: hash, department: null, avatarUrl: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await authService.login({ email: 'a@b.com', password: '12345678' });
    expect(result.accessToken).toBeTruthy();
  });

  it('throws on wrong password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1', passwordHash: await bcrypt.hash('right', 4),
    } as any);
    await expect(authService.login({ email: 'a@b.com', password: 'wrong' }))
      .rejects.toThrow('Invalid email or password');
  });
});

describe('authService.updateProfile', () => {
  it('updates name and department', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: '1', email: 'a@b.com', name: 'New', role: 'STUDENT',
      department: 'CS', avatarUrl: null,
    } as any);

    const user = await authService.updateProfile('1', { name: 'New', department: 'CS' });
    expect(user.name).toBe('New');
    expect(user.department).toBe('CS');
  });
});

describe('authService.changePassword', () => {
  it('changes password when current is correct', async () => {
    const hash = await bcrypt.hash('old', 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', passwordHash: hash } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    await expect(authService.changePassword('1', { currentPassword: 'old', newPassword: 'new12345' }))
      .resolves.toBeUndefined();
  });

  it('throws when current password is wrong', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1', passwordHash: await bcrypt.hash('old', 4),
    } as any);
    await expect(authService.changePassword('1', { currentPassword: 'wrong', newPassword: 'new12345' }))
      .rejects.toThrow('Current password is incorrect');
  });
});
