import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Input, Label, Spinner, Badge } from '@demp/ui';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { AdminStats, RecentActivity, User, AdminStudentsResponse, AdminStudentRow } from '../lib/types';

const PAGE_SIZES = [10, 25, 50, 100];

function exportCSV(rows: AdminStudentRow[]) {
  const headers = ['Name', 'Department', 'Year', 'Phone', 'Email', 'Event', 'Registration ID', 'Status', 'Registered At'];
  const csv = [
    headers.join(','),
    ...rows.map((r) => [
      `"${r.user.name}"`,
      `"${r.user.department || ''}"`,
      `"${r.user.yearOfStudy || ''}"`,
      `"${r.user.phone || ''}"`,
      `"${r.user.email}"`,
      `"${r.event.title}"`,
      `"${r.registrationId}"`,
      r.status,
      new Date(r.registeredAt).toISOString(),
    ].join(',')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(rows: AdminStudentRow[]) {
  const headers = ['Name', 'Department', 'Year', 'Phone', 'Email', 'Event', 'Registration ID', 'Status', 'Checked In', 'Registered At'];
  const rowsHtml = rows.map((r) => `<tr>${[r.user.name, r.user.department || '', r.user.yearOfStudy || '', r.user.phone || '', r.user.email, r.event.title, r.registrationId, r.status, r.checkedIn ? 'Yes' : 'No', new Date(r.registeredAt).toLocaleString()].map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  const html = `<html><head><meta charset="utf-8"><title>Students</title></head><body><table><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rowsHtml}</table></body></html>`;
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invitation, setInvitation] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [mainCat, setMainCat] = useState<'TECHNICAL' | 'NON_TECHNICAL'>('TECHNICAL');
  const [subCat, setSubCat] = useState('');
  const [customSub, setCustomSub] = useState('');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [studentsMeta, setStudentsMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [studentsFilters, setStudentsFilters] = useState({ years: [] as string[], departments: [] as string[], events: [] as { id: string; title: string }[] });
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [filters, setFilters] = useState({ search: '', yearOfStudy: '', department: '', eventId: '', status: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const fetchStudents = useCallback(() => {
    setStudentsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.yearOfStudy) params.set('yearOfStudy', filters.yearOfStudy);
    if (filters.department) params.set('department', filters.department);
    if (filters.eventId) params.set('eventId', filters.eventId);
    if (filters.status) params.set('status', filters.status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    api.get<AdminStudentsResponse>(`/admin/students?${params}`)
      .then((res) => {
        setStudents(res.data);
        setStudentsMeta(res.meta);
        setStudentsFilters(res.filters);
      })
      .finally(() => setStudentsLoading(false));
  }, [filters, page, limit]);

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>('/admin/stats'),
      api.get<RecentActivity>('/admin/recent-activity'),
      api.get<User[]>('/admin/users'),
    ]).then(([s, a, u]) => {
      setStats(s);
      setActivity(a);
      setUsers(u);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/events', {
        title, description, invitation: invitation || null,
        date: new Date(date).toISOString(), location,
        capacity: parseInt(capacity), mainCategory: mainCat,
        subCategory: subCat || customSub || 'OTHER', status: 'DRAFT',
      });
      setCreated(true);
      setShowCreate(false);
      setTitle(''); setDescription(''); setInvitation('');
      setDate(''); setLocation(''); setCapacity('');
      setSubCat(''); setCustomSub('');
      setTimeout(() => setCreated(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const SUB_OPTIONS = ['QUIZ', 'DECODE', 'WPM', 'HACKATHON', 'WORKSHOP', 'CODING', 'CULTURAL', 'SPORTS', 'DEBATE'];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const currentDisplayed = studentsMeta.total > 0
    ? Math.min(students.length, studentsMeta.limit)
    : 0;

  const exportCurrent = () => {
    const rows = students.map((r) => r);
    if (confirm(`Export ${rows.length} record${rows.length !== 1 ? 's' : ''}?`)) {
      exportCSV(rows);
    }
  };

  const exportCurrentExcel = () => {
    const rows = students.map((r) => r);
    if (confirm(`Export ${rows.length} record${rows.length !== 1 ? 's' : ''}?`)) {
      exportExcel(rows);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#f5f5f5] tracking-tight">Admin Overview</h1>
        <div className="flex gap-2">
          <Link to="/admin/qr-scanner">
            <Button variant="outline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              QR Scanner
            </Button>
          </Link>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create Event
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Date & Time</Label><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Main Category</Label>
                  <select value={mainCat} onChange={(e) => setMainCat(e.target.value as any)}
                    className="h-11 w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 focus-visible:outline-none focus-visible:border-primary-500/40 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
                    <option value="TECHNICAL" className="bg-[#06060e]">Technical</option>
                    <option value="NON_TECHNICAL" className="bg-[#06060e]">Non-Technical</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subcategory</Label>
                  <select value={subCat} onChange={(e) => { setSubCat(e.target.value); if (e.target.value !== '__custom__') setCustomSub(''); }}
                    className="h-11 w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 focus-visible:outline-none focus-visible:border-primary-500/40 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
                    <option value="" className="bg-[#06060e]">Select</option>
                    {SUB_OPTIONS.map((s) => (<option key={s} value={s} className="bg-[#06060e]">{s}</option>))}
                    <option value="__custom__" className="bg-[#06060e]">+ Custom</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Custom Sub</Label>
                  <Input value={customSub} onChange={(e) => setCustomSub(e.target.value)} placeholder={subCat === '__custom__' ? 'Type here...' : 'Select custom above'} disabled={subCat !== '__custom__'} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required
                  className="w-full h-20 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 py-2.5 focus-visible:outline-none focus-visible:border-primary-500/40 resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Invitation / Rules (editable, no text limit)</Label>
                <textarea value={invitation} onChange={(e) => setInvitation(e.target.value)}
                  className="w-full h-40 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 py-2.5 focus-visible:outline-none focus-visible:border-primary-500/40 resize-y font-mono"
                  placeholder="Write the event invitation, rules, and any other details here...&#10;&#10;Example:&#10;- Team size: 2-4&#10;- Bring your own laptop&#10;- Certificates for all participants" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={creating}>{created ? 'Created!' : 'Publish Event'}</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {created && (
        <div className="text-sm text-green-300 bg-green-500/10 rounded-2xl px-4 py-3 border border-green-500/10 font-medium">
          Event created successfully!
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent><p className="text-[22px] font-bold text-white/90">{stats?.totalEvents}</p><p className="text-xs text-white/30 font-medium">Total Events</p></CardContent></Card>
        <Card><CardContent><p className="text-[22px] font-bold text-white/90">{stats?.openEvents}</p><p className="text-xs text-white/30 font-medium">Open Events</p></CardContent></Card>
        <Card><CardContent><p className="text-[22px] font-bold text-white/90">{stats?.totalUsers}</p><p className="text-xs text-white/30 font-medium">Users</p></CardContent></Card>
        <Card><CardContent><p className="text-[22px] font-bold text-white/90">{stats?.totalRegistrations}</p><p className="text-xs text-white/30 font-medium">Registrations</p></CardContent></Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Registered Students</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCurrent} disabled={students.length === 0}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportCurrentExcel} disabled={students.length === 0}>
              Export Excel
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <Input
            placeholder="Search name, email, phone..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <select value={filters.yearOfStudy} onChange={(e) => handleFilterChange('yearOfStudy', e.target.value)}
            className="h-11 w-full sm:w-36 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
            <option value="" className="bg-[#06060e]">All Years</option>
            {studentsFilters.years.map((y) => (<option key={y} value={y} className="bg-[#06060e]">{y}</option>))}
          </select>
          <select value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)}
            className="h-11 w-full sm:w-44 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
            <option value="" className="bg-[#06060e]">All Departments</option>
            {studentsFilters.departments.map((d) => (<option key={d} value={d} className="bg-[#06060e]">{d}</option>))}
          </select>
          <select value={filters.eventId} onChange={(e) => handleFilterChange('eventId', e.target.value)}
            className="h-11 w-full sm:w-48 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
            <option value="" className="bg-[#06060e]">All Events</option>
            {studentsFilters.events.map((e) => (<option key={e.id} value={e.id} className="bg-[#06060e]">{e.title}</option>))}
          </select>
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-11 w-full sm:w-40 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
            <option value="" className="bg-[#06060e]">All Status</option>
            <option value="REGISTERED" className="bg-[#06060e]">Registered</option>
            <option value="CANCELLED" className="bg-[#06060e]">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/30 text-[11px] font-medium uppercase tracking-wider sticky top-0 bg-[#06060e]">
                <th className="text-left px-3 py-3 w-10">#</th>
                <th className="text-left px-3 py-3">Student</th>
                <th className="text-left px-3 py-3">Department</th>
                <th className="text-left px-3 py-3">Year</th>
                <th className="text-left px-3 py-3">Phone</th>
                <th className="text-left px-3 py-3">Email</th>
                <th className="text-left px-3 py-3">Event</th>
                <th className="text-left px-3 py-3">Reg. Date</th>
                <th className="text-left px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsLoading ? (
                <tr><td colSpan={9} className="text-center py-8"><Spinner size="sm" /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-sm text-white/30">No students found</td></tr>
              ) : (
                students.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/[0.03] last:border-0 text-white/70 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-white/30 text-[11px]">{(studentsMeta.page - 1) * studentsMeta.limit + i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-semibold text-primary-300">{r.user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate">{r.user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-white/50">{r.user.department || '—'}</td>
                    <td className="px-3 py-3 text-white/50">{r.user.yearOfStudy || '—'}</td>
                    <td className="px-3 py-3 text-white/50 font-mono text-[12px]">{r.user.phone || '—'}</td>
                    <td className="px-3 py-3 text-white/50 text-[12px]">{r.user.email}</td>
                    <td className="px-3 py-3">
                      <Link to={`/admin/events/${r.event.id}`} className="text-primary-300 hover:text-primary-200 text-[12px] font-medium">
                        {r.event.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-white/40 text-[11px] whitespace-nowrap">
                      {new Date(r.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={r.status === 'REGISTERED' ? 'success' : r.status === 'CANCELLED' ? 'danger' : 'default'}>
                        {r.status === 'REGISTERED' ? (r.checkedIn ? 'Checked In' : 'Registered') : r.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>Total: <span className="text-white/60 font-medium">{studentsMeta.total}</span></span>
            <span>Showing: <span className="text-white/60 font-medium">{Math.min(currentDisplayed, studentsMeta.total)}</span></span>
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="h-7 w-16 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/70 text-xs px-2 appearance-none focus-visible:outline-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.3rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '1.5rem' }}>
                {PAGE_SIZES.map((s) => (<option key={s} value={s} className="bg-[#06060e]">{s}</option>))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={studentsMeta.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="text-xs text-white/40 px-1">
              Page <span className="text-white/60">{studentsMeta.page}</span> of <span className="text-white/60">{studentsMeta.totalPages || 1}</span>
            </span>
            <Button variant="ghost" size="sm" disabled={studentsMeta.page >= studentsMeta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Recent Registrations</h2>
        <div className="space-y-2">
          {activity?.recentRegistrations.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white/80">{reg.user.name}</p>
                  <p className="text-xs text-white/30">{reg.user.email} &middot; registered for <Link to={`/admin/events/${reg.event.id}`} className="text-primary-300 hover:text-primary-200">{reg.event.title}</Link></p>
                </div>
                <span className="text-[11px] text-white/30">{new Date(reg.registeredAt).toLocaleDateString()}</span>
              </CardContent>
            </Card>
          ))}
          {activity?.recentRegistrations.length === 0 && (
            <p className="text-sm text-white/30">No recent registrations</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
