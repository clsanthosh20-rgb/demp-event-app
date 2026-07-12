import { prisma } from '../../lib/prisma.js';

async function getStats() {
  const [
    totalEvents,
    openEvents,
    totalUsers,
    totalRegistrations,
    eventsByMainCategory,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: 'OPEN' } }),
    prisma.user.count(),
    prisma.registration.count({ where: { status: 'REGISTERED' } }),
    prisma.event.groupBy({ by: ['mainCategory'], _count: true }),
  ]);

  return {
    totalEvents,
    openEvents,
    totalUsers,
    totalRegistrations,
    eventsByMainCategory,
  };
}

async function getRecentActivity() {
  const [recentRegistrations, recentEvents] = await Promise.all([
    prisma.registration.findMany({
      where: { status: 'REGISTERED' },
      orderBy: { registeredAt: 'desc' },
      take: 10,
    }),
    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const regsWithData = await Promise.all(
    recentRegistrations.map(async (reg) => {
      const user = reg.userId
        ? await prisma.user.findUnique({ where: { id: reg.userId } })
        : null;
      const event = reg.eventId
        ? await prisma.event.findUnique({ where: { id: reg.eventId } })
        : null;
      return {
        ...reg,
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
        event: event ? { id: event.id, title: event.title } : null,
      };
    })
  );

  const eventsWithData = await Promise.all(
    recentEvents.map(async (event) => {
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

  return { recentRegistrations: regsWithData, recentEvents: eventsWithData };
}

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      class: true,
      section: true,
      yearOfStudy: true,
      department: true,
      createdAt: true,
    },
  });
  return users.map((u: any) => u);
}

async function getStudents(query: {
  search?: string;
  yearOfStudy?: string;
  department?: string;
  eventId?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  const { search, yearOfStudy, department, eventId, status, page, limit } = query;

  let allRegistrations = await prisma.registration.findMany({
    orderBy: { registeredAt: 'desc' },
  });

  if (eventId) {
    allRegistrations = allRegistrations.filter((r) => r.eventId === eventId);
  }
  if (status) {
    allRegistrations = allRegistrations.filter((r) => r.status === status);
  }

  const regsWithUsers = await Promise.all(
    allRegistrations.map(async (reg) => {
      const user = reg.userId
        ? await prisma.user.findUnique({ where: { id: reg.userId } })
        : null;
      const event = reg.eventId
        ? await prisma.event.findUnique({ where: { id: reg.eventId } })
        : null;
      return { ...reg, user, event };
    })
  );

  let filtered = regsWithUsers;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.user?.name?.toLowerCase().includes(s) ||
        r.user?.email?.toLowerCase().includes(s) ||
        r.user?.phone?.toLowerCase().includes(s)
    );
  }
  if (yearOfStudy) {
    filtered = filtered.filter((r) => r.user?.yearOfStudy === yearOfStudy);
  }
  if (department) {
    filtered = filtered.filter((r) => r.user?.department === department);
  }

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const years = [...new Set(allUsers.map((u: any) => u.yearOfStudy).filter(Boolean))] as string[];
  const departments = [...new Set(allUsers.map((u: any) => u.department).filter(Boolean))] as string[];
  const allEvents = await prisma.event.findMany({
    orderBy: { date: 'desc' },
  });
  const events = allEvents.map((e: any) => ({ id: e.id, title: e.title }));

  return {
    data: paged.map((r: any) => ({
      id: r.id,
      registrationId: r.uniqueRegistrationId,
      registeredAt: r.registeredAt,
      status: r.status,
      checkedIn: r.checkedIn,
      user: r.user
        ? {
            id: r.user.id,
            name: r.user.name,
            email: r.user.email,
            role: r.user.role,
            phone: r.user.phone,
            class: r.user.class,
            section: r.user.section,
            yearOfStudy: r.user.yearOfStudy,
            department: r.user.department,
            createdAt: r.user.createdAt,
          }
        : null,
      event: r.event ? { id: r.event.id, title: r.event.title } : null,
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    filters: { years, departments, events },
  };
}

export const adminService = { getStats, getRecentActivity, getUsers, getStudents };
