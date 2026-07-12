import type { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  try {
    const payload = authService.verifyToken(header.slice(7));
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export { authenticate, authorize };
