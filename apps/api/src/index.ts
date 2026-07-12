import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { onRequest } from 'firebase-functions/v2/https';
import { authRouter } from './modules/auth/auth.router.js';
import { eventsRouter } from './modules/events/events.router.js';
import { registrationRouter } from './modules/registrations/registrations.router.js';
import { notificationRouter } from './modules/notifications/notifications.router.js';
import { rulesRouter } from './modules/rules/rules.router.js';
import { adminRouter } from './modules/admin/admin.router.js';
import { faqRouter } from './modules/faq/faq.router.js';
import { uploadRouter } from './modules/upload/upload.router.js';
import { prisma } from './lib/prisma.js';
import { generateEventPassHtml } from './lib/pdf.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/registrations/:id/pass', async (req, res) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
    });
    if (!registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    const event = registration.eventId
      ? await prisma.event.findUnique({ where: { id: registration.eventId } })
      : null;
    const user = registration.userId
      ? await prisma.user.findUnique({ where: { id: registration.userId } })
      : null;
    const creator = event?.createdById
      ? await prisma.user.findUnique({ where: { id: event.createdById } })
      : null;

    if (!event || !user) {
      res.status(404).json({ error: 'Registration data incomplete' });
      return;
    }

    const d = new Date(event.date);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });

    const html = generateEventPassHtml({
      collegeName: 'DEMP',
      eventName: event.title,
      studentName: user.name,
      department: user.department || '',
      year: user.yearOfStudy || '',
      date: dateStr,
      time: timeStr,
      roomNumber: event.roomNumber || '',
      location: event.location,
      reportingTime: event.reportingTime || '',
      registrationId: registration.uniqueRegistrationId,
      qrDataUrl: registration.qrCodeUrl || '',
      organizerName: creator?.name || '',
      instructions: event.invitation || '',
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate pass' });
  }
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', registrationRouter);
app.use('/api/v1', notificationRouter);
app.use('/api/v1/rules', rulesRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1/faq', faqRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1', uploadRouter);

const webDistPath = path.resolve(__dirname, '../../web/dist');

app.use(express.static(webDistPath));

app.get(/^(?!\/api\/v1|\/health).*/, (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

if (!process.env.FUNCTION_TARGET) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

export const api = onRequest({ cors: true, maxInstances: 10 }, app);
