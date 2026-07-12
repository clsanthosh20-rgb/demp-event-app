import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '@demp/shared';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ sub: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
  const refreshToken = jwt.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  });
  return { accessToken, refreshToken };
}

function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string; role?: string; type?: string };
}

async function register(input: RegisterInput) {
  const existing = await prisma.user.findByEmail(input.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone || null,
      class: input.class || null,
      section: input.section || null,
      yearOfStudy: input.yearOfStudy || null,
      department: input.department || null,
      role: 'STUDENT',
    },
  });

  const tokens = generateTokens(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function login(input: LoginInput) {
  const user = await prisma.user.findByEmail(input.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokens(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function refresh(refreshToken: string) {
  const payload = verifyToken(refreshToken);
  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new Error('User not found');
  }

  const tokens = generateTokens(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: Record<string, string | null | undefined> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone || null;
  if (input.class !== undefined) data.class = input.class || null;
  if (input.section !== undefined) data.section = input.section || null;
  if (input.yearOfStudy !== undefined) data.yearOfStudy = input.yearOfStudy || null;
  if (input.department !== undefined) data.department = input.department || null;
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl || null;

  const user = await prisma.user.update({ where: { id: userId }, data });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    class: user.class,
    section: user.section,
    yearOfStudy: user.yearOfStudy,
    department: user.department,
    avatarUrl: user.avatarUrl,
  };
}

async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export const authService = { register, login, refresh, verifyToken, updateProfile, changePassword };
