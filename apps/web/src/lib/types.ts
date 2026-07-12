export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  phone?: string;
  class?: string;
  section?: string;
  yearOfStudy?: string;
  department?: string;
  avatarUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  invitation?: string | null;
  date: string;
  location: string;
  roomNumber?: string | null;
  reportingTime?: string | null;
  registrationDeadline?: string | null;
  capacity: number;
  mainCategory: string;
  subCategory: string;
  status: string;
  imageUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
  _count: { registrations: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  uniqueRegistrationId: string;
  status: string;
  registeredAt: string;
  qrCodeUrl: string | null;
  checkedIn: boolean;
  checkInTime: string | null;
  checkInAdminId: string | null;
  checkInDevice: string | null;
  event: Event;
  user?: User;
}

export interface AdminStats {
  totalEvents: number;
  openEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  eventsByMainCategory: { mainCategory: string; _count: number }[];
}

export interface RecentActivity {
  recentRegistrations: {
    id: string;
    user: { id: string; name: string; email: string };
    event: { id: string; title: string };
    registeredAt: string;
  }[];
  recentEvents: Event[];
}

export interface AdminStudentRow {
  id: string;
  registrationId: string;
  registeredAt: string;
  status: string;
  checkedIn: boolean;
  user: {
    id: string; name: string; email: string; role: string;
    phone: string | null; class: string | null; section: string | null;
    yearOfStudy: string | null; department: string | null; createdAt: string;
  };
  event: { id: string; title: string };
}

export interface AdminStudentsResponse {
  data: AdminStudentRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  filters: {
    years: string[];
    departments: string[];
    events: { id: string; title: string }[];
  };
}
