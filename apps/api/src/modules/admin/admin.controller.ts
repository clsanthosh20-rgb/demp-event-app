import type { Request, Response } from 'express';
import { adminService } from './admin.service.js';

async function stats(_req: Request, res: Response) {
  const data = await adminService.getStats();
  res.json(data);
}

async function recentActivity(_req: Request, res: Response) {
  const data = await adminService.getRecentActivity();
  res.json(data);
}

async function users(_req: Request, res: Response) {
  const data = await adminService.getUsers();
  res.json(data);
}

async function students(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
  const search = (req.query.search as string) || undefined;
  const yearOfStudy = (req.query.yearOfStudy as string) || undefined;
  const department = (req.query.department as string) || undefined;
  const eventId = (req.query.eventId as string) || undefined;
  const status = (req.query.status as string) || undefined;

  const data = await adminService.getStudents({
    search, yearOfStudy, department, eventId, status, page, limit,
  });
  res.json(data);
}

export const adminController = { stats, recentActivity, users, students };
