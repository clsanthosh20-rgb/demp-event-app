import { prisma } from '../../lib/prisma.js';
import { notificationService } from '../notifications/notifications.service.js';
import { emailService } from '../../lib/email.js';
import QRCode from 'qrcode';

function generateRegistrationId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `DEMP-${year}-${random}`;
}

async function register(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.status !== 'OPEN') throw new Error('Event is not open for registration');

  if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
    throw new Error('Registration deadline has passed');
  }

  const existing = await prisma.registration.findByUserAndEvent(userId, eventId);
  if (existing) throw new Error('Already registered');

  const count = await prisma.registration.count({
    where: { eventId, status: 'REGISTERED' },
  });
  if (count >= event.capacity) throw new Error('Event is full');

  let uniqueRegistrationId = generateRegistrationId();
  while (await prisma.registration.findByUniqueRegistrationId(uniqueRegistrationId)) {
    uniqueRegistrationId = generateRegistrationId();
  }

  let qrCodeUrl: string | null = null;
  try {
    qrCodeUrl = await QRCode.toDataURL(uniqueRegistrationId, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a3e', light: '#ffffff' },
    });
  } catch {
    console.warn('[Registration] QR generation failed');
  }

  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      uniqueRegistrationId,
      qrCodeUrl,
      status: 'REGISTERED',
      checkedIn: false,
    },
  });

  console.log('[Registration] Created:', uniqueRegistrationId, 'for event:', event.title);

  const creator = event.createdById
    ? await prisma.user.findUnique({ where: { id: event.createdById } })
    : null;
  const regCount = await prisma.registration.count({
    where: { eventId: event.id, status: 'REGISTERED' },
  });

  await notificationService.create(
    userId,
    'REGISTRATION_CONFIRMATION',
    'Registration Confirmed',
    `You have registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()}. Registration ID: ${uniqueRegistrationId}`,
    `/my-registrations`,
  );

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const d = new Date(event.date);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const collegeName = process.env.COLLEGE_NAME || 'University/College Name';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const qrPageLink = `${appUrl}/my-registrations`;
    const { subject, html } = emailService.templates.registrationConfirmation(
      user.name,
      event.title,
      dateStr,
      timeStr,
      event.roomNumber || '',
      event.location,
      event.reportingTime || '',
      uniqueRegistrationId,
      qrCodeUrl || '',
      creator?.name || '',
      collegeName,
      qrPageLink,
    );
    console.log('[Registration] Attempting confirmation email to:', user.email);
    emailService.sendMail(user.email, subject, html)
      .then(() => console.log('[Registration] Confirmation email sent to:', user.email))
      .catch((err: Error) =>
        console.warn('[Registration] Confirmation email failed for', user.email, ':', err.message)
      );
  }

  return {
    ...registration,
    event: {
      ...event,
      createdBy: creator ? { id: creator.id, name: creator.name } : null,
      _count: { registrations: regCount },
    },
  };
}

async function getMyRegistrations(userId: string) {
  const regs = await prisma.registration.findMany({
    where: { userId, status: { not: 'CANCELLED' } },
    orderBy: { registeredAt: 'desc' },
  });

  return Promise.all(
    regs.map(async (reg) => {
      const event = await prisma.event.findUnique({ where: { id: reg.eventId } });
      if (!event) return null;
      const creator = event.createdById
        ? await prisma.user.findUnique({ where: { id: event.createdById } })
        : null;
      const regCount = await prisma.registration.count({
        where: { eventId: event.id, status: 'REGISTERED' },
      });
      return {
        ...reg,
        event: {
          ...event,
          createdBy: creator ? { id: creator.id, name: creator.name } : null,
          _count: { registrations: regCount },
        },
      };
    })
  ).then((results) => results.filter(Boolean));
}

async function checkIn(registrationId: string, adminId: string, device: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration) throw new Error('Registration not found');

  const alreadyCheckedIn = registration.checkedIn;

  const user = registration.userId
    ? await prisma.user.findUnique({ where: { id: registration.userId } })
    : null;
  const event = registration.eventId
    ? await prisma.event.findUnique({ where: { id: registration.eventId } })
    : null;

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      checkedIn: true,
      checkInTime: new Date(),
      checkInAdminId: adminId,
      checkInDevice: device,
    },
  });

  return {
    ...registration,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
          yearOfStudy: user.yearOfStudy,
        }
      : null,
    event: event ? { id: event.id, title: event.title } : null,
    alreadyCheckedIn,
    checkedIn: updated.checkedIn,
    checkInTime: updated.checkInTime,
  };
}

async function verifyByRegistrationId(uniqueRegistrationId: string) {
  const registration = await prisma.registration.findByUniqueRegistrationId(uniqueRegistrationId);
  if (!registration) throw new Error('Invalid registration ID');

  const user = registration.userId
    ? await prisma.user.findUnique({ where: { id: registration.userId } })
    : null;
  const event = registration.eventId
    ? await prisma.event.findUnique({ where: { id: registration.eventId } })
    : null;

  return {
    ...registration,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
          yearOfStudy: user.yearOfStudy,
          class: user.class,
          section: user.section,
        }
      : null,
    event: event
      ? {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          roomNumber: event.roomNumber,
        }
      : null,
  };
}

async function removeRegistration(registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration) throw new Error('Registration not found');
  await prisma.registration.delete({ where: { id: registrationId } });
  return { success: true };
}

export const registrationService = {
  register,
  getMyRegistrations,
  checkIn,
  verifyByRegistrationId,
  removeRegistration,
};
