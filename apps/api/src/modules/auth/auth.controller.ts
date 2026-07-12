import type { Request, Response } from 'express';
import { registerSchema, loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema } from '@demp/shared';
import { authService } from './auth.service.js';
import { prisma } from '../../lib/prisma.js';

async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await authService.register(parsed.data);
    res.status(201).json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Registration failed';
    res.status(409).json({ error: message });
  }
}

async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await authService.login(parsed.data);
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Login failed';
    res.status(401).json({ error: message });
  }
}

async function refresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await authService.refresh(parsed.data.refreshToken);
    res.json(result);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
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
  });
}

async function updateProfile(req: Request, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const user = await authService.updateProfile(req.userId!, parsed.data);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Update failed' });
  }
}

async function changePassword(req: Request, res: Response) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    await authService.changePassword(req.userId!, parsed.data);
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Password change failed';
    res.status(400).json({ error: message });
  }
}

export const authController = { register, login, refresh, me, updateProfile, changePassword };
