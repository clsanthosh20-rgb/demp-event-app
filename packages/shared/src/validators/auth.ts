import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
  class: z.string().max(50).optional(),
  section: z.string().max(10).optional(),
  yearOfStudy: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
  class: z.string().max(50).optional(),
  section: z.string().max(10).optional(),
  yearOfStudy: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
