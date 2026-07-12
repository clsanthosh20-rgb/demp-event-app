import type { Request, Response } from 'express';
import { registrationService } from './registrations.service.js';

async function register(req: Request, res: Response) {
  const eventId = req.params.id as string;
  try {
    const result = await registrationService.register(req.userId!, eventId);
    res.status(201).json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
}

async function myRegistrations(req: Request, res: Response) {
  const registrations = await registrationService.getMyRegistrations(req.userId!);
  res.json(registrations);
}

async function checkIn(req: Request, res: Response) {
  const { registrationId } = req.body;
  const device = String(req.headers['user-agent'] ?? 'unknown');
  try {
    const result = await registrationService.checkIn(registrationId, req.userId!, device);
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Check-in failed';
    res.status(400).json({ error: message });
  }
}

async function verify(req: Request, res: Response) {
  const code = String(req.params.code ?? '');
  try {
    const result = await registrationService.verifyByRegistrationId(code);
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Verification failed';
    res.status(400).json({ error: message });
  }
}

async function removeRegistration(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const result = await registrationService.removeRegistration(id);
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to remove registration';
    res.status(400).json({ error: message });
  }
}

export const registrationController = { register, myRegistrations, checkIn, verify, removeRegistration };
