import { z } from 'zod';

export const createRuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required').max(100),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateRuleSchema = createRuleSchema.partial();

export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
