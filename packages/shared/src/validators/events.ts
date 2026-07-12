import { z } from 'zod';

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  mainCategory: z.string().optional(),
  subCategory: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  invitation: z.string().optional().nullable(),
  date: z.string().datetime({ message: 'Invalid date format' }),
  location: z.string().min(1, 'Location is required').max(200),
  roomNumber: z.string().optional().nullable(),
  reportingTime: z.string().optional().nullable(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  capacity: z.number().int().positive('Capacity must be positive'),
  mainCategory: z.enum(['TECHNICAL', 'NON_TECHNICAL']).default('TECHNICAL'),
  subCategory: z.string().default('OTHER'),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED']).default('DRAFT'),
  imageUrl: z.string().optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial();

export const bulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID required'),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED']),
});

export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
