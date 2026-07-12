import { prisma } from '../../lib/prisma.js';

async function list(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });
  return { notifications, unreadCount };
}

async function markRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) throw new Error('Notification not found');
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

async function create(userId: string, type: string, title: string, message: string, link?: string) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
      read: false,
    },
  });
}

export const notificationService = { list, markRead, markAllRead, create };
