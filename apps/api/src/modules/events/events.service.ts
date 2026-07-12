import { prisma } from '../../lib/prisma.js';
import type { EventQueryInput, CreateEventInput, UpdateEventInput } from '@demp/shared';

async function list(query: EventQueryInput) {
  const { page, limit, mainCategory, subCategory, status, search } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (mainCategory) where.mainCategory = mainCategory;
  if (subCategory) where.subCategory = subCategory;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    orderBy: { date: 'asc' },
  });

  const count = await prisma.event.count({ where });

  const data = await Promise.all(
    events.map(async (event) => {
      const creator = event.createdById
        ? await prisma.user.findUnique({ where: { id: event.createdById } })
        : null;
      const regCount = await prisma.registration.count({
        where: { eventId: event.id, status: 'REGISTERED' },
      });
      return {
        ...event,
        createdBy: creator ? { id: creator.id, name: creator.name } : null,
        _count: { registrations: regCount },
      };
    })
  );

  return {
    data,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

async function getById(id: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return null;

  const creator = event.createdById
    ? await prisma.user.findUnique({ where: { id: event.createdById } })
    : null;
  const regCount = await prisma.registration.count({
    where: { eventId: event.id, status: 'REGISTERED' },
  });

  return {
    ...event,
    createdBy: creator ? { id: creator.id, name: creator.name } : null,
    _count: { registrations: regCount },
  };
}

async function create(data: CreateEventInput & { createdById: string }) {
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      invitation: data.invitation || null,
      date: new Date(data.date),
      location: data.location,
      roomNumber: data.roomNumber || null,
      reportingTime: data.reportingTime || null,
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline)
        : null,
      capacity: data.capacity,
      mainCategory: data.mainCategory || 'TECHNICAL',
      subCategory: data.subCategory || 'OTHER',
      status: data.status || 'DRAFT',
      imageUrl: data.imageUrl || null,
      createdById: data.createdById,
    },
  });

  const creator = await prisma.user.findUnique({ where: { id: data.createdById } });
  return {
    ...event,
    createdBy: creator ? { id: creator.id, name: creator.name } : null,
    _count: { registrations: 0 },
  };
}

async function update(id: string, data: UpdateEventInput) {
  const updateData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue;
    if (key === 'date' && val) {
      updateData.date = new Date(val as string);
    } else if (key === 'registrationDeadline') {
      updateData.registrationDeadline = val ? new Date(val as string) : null;
    } else {
      updateData[key] = val;
    }
  }
  const event = await prisma.event.update({ where: { id }, data: updateData });
  return event;
}

async function remove(id: string) {
  await prisma.registration.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
}

async function clone(id: string, userId: string) {
  const original = await prisma.event.findUnique({ where: { id } });
  if (!original) throw new Error('Event not found');
  const event = await prisma.event.create({
    data: {
      title: `${original.title} (copy)`,
      description: original.description,
      invitation: original.invitation,
      date: original.date,
      location: original.location,
      roomNumber: original.roomNumber,
      reportingTime: original.reportingTime,
      registrationDeadline: original.registrationDeadline,
      capacity: original.capacity,
      mainCategory: original.mainCategory,
      subCategory: original.subCategory,
      status: 'DRAFT',
      imageUrl: original.imageUrl,
      createdById: userId,
    },
  });
  const creator = await prisma.user.findUnique({ where: { id: userId } });
  return {
    ...event,
    createdBy: creator ? { id: creator.id, name: creator.name } : null,
    _count: { registrations: 0 },
  };
}

async function getRegistrations(eventId: string) {
  const regs = await prisma.registration.findMany({
    where: { eventId },
    orderBy: { registeredAt: 'desc' },
  });

  return Promise.all(
    regs.map(async (reg) => {
      const user = reg.userId
        ? await prisma.user.findUnique({ where: { id: reg.userId } })
        : null;
      return {
        ...reg,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              class: user.class,
              section: user.section,
              yearOfStudy: user.yearOfStudy,
              department: user.department,
            }
          : null,
      };
    })
  );
}

async function bulkUpdateStatus(ids: string[], status: string) {
  await prisma.event.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
}

export const eventsService = { list, getById, create, update, remove, clone, getRegistrations, bulkUpdateStatus };
