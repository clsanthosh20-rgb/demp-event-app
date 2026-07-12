import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Card, CardContent, Input, Spinner } from '@demp/ui';
import { api } from '../lib/api';
import type { Event, User } from '../lib/types';

interface RegistrationWithUser {
  id: string;
  userId: string;
  uniqueRegistrationId: string;
  status: string;
  registeredAt: string;
  qrCodeUrl: string | null;
  checkedIn: boolean;
  checkInTime: string | null;
  user: User;
}

type SortField = 'checkInTime' | 'name' | 'department' | 'year';
type Tab = 'registrations' | 'attendance';

function AdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('registrations');

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('checkInTime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(() => {
    if (!id) return;
    api.get<RegistrationWithUser[]>(`/events/${id}/registrations`).then(setRegistrations);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Event>(`/events/${id}`),
      api.get<RegistrationWithUser[]>(`/events/${id}/registrations`),
    ]).then(([evt, regs]) => {
      setEvent(evt);
      setRegistrations(regs);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === 'attendance') {
      pollRef.current = setInterval(fetchData, 10000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [tab, fetchData]);

  const handleRemoveRegistration = async (regId: string, studentName: string) => {
    if (!confirm(`Remove ${studentName} from this event?`)) return;
    setRemovingId(regId);
    try {
      await api.del(`/registrations/${regId}`);
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove registration');
    } finally {
      setRemovingId(null);
    }
  };

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const totalRegs = registrations.length;
  const remaining = totalRegs - checkedInCount;
  const attendancePct = totalRegs > 0 ? Math.round((checkedInCount / totalRegs) * 100) : 0;

  const departments = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => { if (r.user.department) set.add(r.user.department); });
    return Array.from(set).sort();
  }, [registrations]);

  const years = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => { if (r.user.yearOfStudy) set.add(r.user.yearOfStudy); });
    return Array.from(set).sort();
  }, [registrations]);

  const checkedInStudents = useMemo(() => {
    let list = registrations.filter((r) => r.checkedIn);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.uniqueRegistrationId.toLowerCase().includes(q)
      );
    }
    if (deptFilter) list = list.filter((r) => r.user.department === deptFilter);
    if (yearFilter) list = list.filter((r) => r.user.yearOfStudy === yearFilter);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'checkInTime':
          cmp = (a.checkInTime || '').localeCompare(b.checkInTime || '');
          break;
        case 'name':
          cmp = a.user.name.localeCompare(b.user.name);
          break;
        case 'department':
          cmp = (a.user.department || '').localeCompare(b.user.department || '');
          break;
        case 'year':
          cmp = (a.user.yearOfStudy || '').localeCompare(b.user.yearOfStudy || '');
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [registrations, search, deptFilter, yearFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!event) return <p className="text-white/30">Event not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#f5f5f5] tracking-tight break-words">{event.title}</h1>
        <div className="flex gap-2 shrink-0">
          <Link to={`/admin/events/${event.id}/edit`}><Button variant="outline">Edit</Button></Link>
          <Button variant="ghost" onClick={async () => { await api.post(`/events/${event.id}/clone`); alert('Cloned!'); }}>Clone</Button>
        </div>
      </div>

      {event.imageUrl && (
        <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.06]">
          <img src={event.imageUrl} alt={event.title} className="w-full aspect-[2/1] object-cover" />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent><p className="text-xs text-white/30 font-medium">Date</p><p className="text-sm text-white/80 mt-0.5">{new Date(event.date).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-white/30 font-medium">Location</p><p className="text-sm text-white/80 mt-0.5">{event.location}{event.roomNumber ? `, Room ${event.roomNumber}` : ''}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-white/30 font-medium">Category</p><p className="text-sm text-white/80 mt-0.5">{event.mainCategory === 'TECHNICAL' ? 'Technical' : 'Non-Technical'} / {event.subCategory}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-white/30 font-medium">Registrations</p><p className="text-sm text-white/80 mt-0.5">{event._count.registrations}/{event.capacity}</p></CardContent></Card>
      </div>

      {event.reportingTime && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="primary">Reporting: {event.reportingTime}</Badge>
        </div>
      )}

      <div className="flex gap-2">
        <Badge variant={event.status === 'OPEN' ? 'success' : event.status === 'DRAFT' ? 'default' : 'danger'}>{event.status}</Badge>
        <Badge variant="primary">{event.mainCategory}</Badge>
        <Badge>{event.subCategory}</Badge>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <h2 className="text-[15px] font-semibold text-white/50 tracking-tight">Description</h2>
          <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </CardContent>
      </Card>

      {event.invitation && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <h2 className="text-[15px] font-semibold text-white/50 tracking-tight">Invitation / Rules</h2>
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{event.invitation}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1 border-b border-white/[0.06]">
        <button onClick={() => setTab('registrations')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === 'registrations' ? 'text-white/80' : 'text-white/30 hover:text-white/50'}`}>
          All Registrations
          {tab === 'registrations' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
        </button>
        <button onClick={() => setTab('attendance')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === 'attendance' ? 'text-white/80' : 'text-white/30 hover:text-white/50'}`}>
          Attendance
          {tab === 'attendance' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
        </button>
      </div>

      {tab === 'registrations' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">
              Registrations ({registrations.length})
            </h2>
            <div className="flex gap-3 text-xs text-white/30">
              <span>Checked in: <span className="text-green-400 font-semibold">{checkedInCount}</span></span>
              <span>Pending: <span className="text-yellow-400 font-semibold">{registrations.length - checkedInCount}</span></span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm responsive-table">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/30 text-[11px] font-medium uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Department</th>
                  <th className="text-left px-4 py-3">Year</th>
                  <th className="text-left px-4 py-3">Reg ID</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Check-in</th>
                  <th className="text-left px-4 py-3">Registered</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-white/[0.03] last:border-0 text-white/70 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white/90">{reg.user.name}</td>
                    <td className="px-4 py-3 text-white/50">{reg.user.email}</td>
                    <td className="px-4 py-3 text-white/50">{reg.user.department || '—'}</td>
                    <td className="px-4 py-3 text-white/50">{reg.user.yearOfStudy || '—'}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-primary-300">{reg.uniqueRegistrationId}</td>
                    <td className="px-4 py-3"><Badge variant={reg.status === 'REGISTERED' ? 'success' : 'default'}>{reg.status}</Badge></td>
                    <td className="px-4 py-3">
                      {reg.checkedIn ? (
                        <span className="text-green-400 text-[11px]">{new Date(reg.checkInTime!).toLocaleTimeString()}</span>
                      ) : (
                        <span className="text-white/20 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-[11px]">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-300/50 hover:text-red-300"
                        loading={removingId === reg.id}
                        onClick={() => handleRemoveRegistration(reg.id, reg.user.name)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-8 text-sm text-white/30">No registrations yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'attendance' && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent><p className="text-[22px] font-bold text-white/90">{totalRegs}</p><p className="text-xs text-white/30 font-medium">Total Registrations</p></CardContent></Card>
            <Card><CardContent><p className="text-[22px] font-bold text-green-400">{checkedInCount}</p><p className="text-xs text-white/30 font-medium">Total Checked In</p></CardContent></Card>
            <Card><CardContent><p className="text-[22px] font-bold text-yellow-400">{remaining}</p><p className="text-xs text-white/30 font-medium">Remaining</p></CardContent></Card>
            <Card><CardContent><p className="text-[22px] font-bold text-primary-400">{attendancePct}%</p><p className="text-xs text-white/30 font-medium">Attendance</p></CardContent></Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Input
              placeholder="Search by name or registration ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              className="h-11 w-full sm:w-44 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
              <option value="" className="bg-[#06060e]">All Departments</option>
              {departments.map((d) => (<option key={d} value={d} className="bg-[#06060e]">{d}</option>))}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
              className="h-11 w-full sm:w-36 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem' }}>
              <option value="" className="bg-[#06060e]">All Years</option>
              {years.map((y) => (<option key={y} value={y} className="bg-[#06060e]">{y}</option>))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm responsive-table">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/30 text-[11px] font-medium uppercase tracking-wider">
                  <th className="text-left px-4 py-3 cursor-pointer select-none hover:text-white/50" onClick={() => toggleSort('name')}>
                    Student Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left px-4 py-3">Department</th>
                  <th className="text-left px-4 py-3">Academic Year</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Registration ID</th>
                  <th className="text-left px-4 py-3 cursor-pointer select-none hover:text-white/50" onClick={() => toggleSort('checkInTime')}>
                    Check-in Time {sortField === 'checkInTime' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {checkedInStudents.length > 0 ? (
                  checkedInStudents.map((reg) => (
                    <tr key={reg.id} className="border-b border-white/[0.03] last:border-0 text-white/70 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{reg.user.name}</td>
                      <td className="px-4 py-3 text-white/50">{reg.user.department || '—'}</td>
                      <td className="px-4 py-3 text-white/50">{reg.user.yearOfStudy || '—'}</td>
                      <td className="px-4 py-3 text-white/50 text-[12px]">{reg.user.email}</td>
                      <td className="px-4 py-3 text-white/50 font-mono text-[12px]">{reg.user.phone || '—'}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-primary-300">{reg.uniqueRegistrationId}</td>
                      <td className="px-4 py-3 text-white/40 text-[11px] whitespace-nowrap">
                        {reg.checkInTime ? new Date(reg.checkInTime).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-green-400 text-[12px] font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Checked In
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="text-center py-8 text-sm text-white/30">No checked-in students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminEventDetail;
