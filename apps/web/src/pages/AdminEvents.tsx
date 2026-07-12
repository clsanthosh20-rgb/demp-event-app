import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Badge, Spinner } from '@demp/ui';
import { api } from '../lib/api';
import type { Event, PaginatedResponse } from '../lib/types';

function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('');
  const [mainCatFilter, setMainCatFilter] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (statusFilter) params.set('status', statusFilter);
    if (mainCatFilter) params.set('mainCategory', mainCatFilter);
    api.get<PaginatedResponse<Event>>(`/events?${params}`)
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter, mainCatFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === events.length) setSelected(new Set());
    else setSelected(new Set(events.map((e) => e.id)));
  };

  const bulkStatus = async (status: string) => {
    await api.del('/events/bulk-status');
    await api.post('/events/bulk-status', { ids: Array.from(selected), status });
    setSelected(new Set());
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await api.del(`/events/${id}`);
    fetch();
  };

  const handleClone = async (id: string) => {
    await api.post(`/events/${id}/clone`);
    fetch();
  };

  const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    OPEN: 'success', CLOSED: 'danger', DRAFT: 'default', CANCELLED: 'danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-white/90 tracking-tight">Event Management</h1>
        <Link to="/admin/events/new"><Button>Create Event</Button></Link>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 w-32 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem',
          }}>
          <option value="" className="bg-[#06060e]">All Status</option>
          <option value="DRAFT" className="bg-[#06060e]">Draft</option>
          <option value="OPEN" className="bg-[#06060e]">Open</option>
          <option value="CLOSED" className="bg-[#06060e]">Closed</option>
          <option value="CANCELLED" className="bg-[#06060e]">Cancelled</option>
        </select>
        <select value={mainCatFilter} onChange={(e) => setMainCatFilter(e.target.value)}
          className="h-11 w-36 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem',
          }}>
          <option value="" className="bg-[#06060e]">All Categories</option>
          <option value="TECHNICAL" className="bg-[#06060e]">Technical</option>
          <option value="NON_TECHNICAL" className="bg-[#06060e]">Non-Technical</option>
        </select>
        {selected.size > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-white/40">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulkStatus('OPEN')}>Open</Button>
            <Button size="sm" variant="outline" onClick={() => bulkStatus('CLOSED')}>Close</Button>
            <Button size="sm" variant="outline" onClick={() => bulkStatus('CANCELLED')}>Cancel</Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/30 text-[11px] font-medium uppercase tracking-wider">
                <th className="w-10 px-3 py-3"><input type="checkbox" checked={selected.size === events.length && events.length > 0} onChange={toggleAll} className="accent-primary-500" /></th>
                <th className="text-left px-3 py-3">Title</th>
                <th className="text-left px-3 py-3">Category</th>
                <th className="text-left px-3 py-3">Subcategory</th>
                <th className="text-left px-3 py-3">Date</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Registrations</th>
                <th className="text-right px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-white/[0.03] last:border-0 text-white/70 hover:bg-white/[0.02]">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.has(event.id)} onChange={() => toggleSelect(event.id)} className="accent-primary-500" /></td>
                  <td className="px-3 py-3">
                    <Link to={`/admin/events/${event.id}`} className="font-medium text-white/90 hover:text-primary-300">{event.title}</Link>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={event.mainCategory === 'TECHNICAL' ? 'primary' : 'warning'}>
                      {event.mainCategory === 'TECHNICAL' ? 'Technical' : 'Non-Technical'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-white/50">{event.subCategory}</td>
                  <td className="px-3 py-3 text-white/50">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="px-3 py-3"><Badge variant={statusColors[event.status] || 'default'}>{event.status}</Badge></td>
                  <td className="px-3 py-3 text-white/50">{event._count.registrations}/{event.capacity}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Link to={`/admin/events/${event.id}`}><Button variant="ghost" size="sm" className="text-white/30">View</Button></Link>
                      <Link to={`/admin/events/${event.id}/edit`}><Button variant="ghost" size="sm" className="text-white/30">Edit</Button></Link>
                      <Button variant="ghost" size="sm" className="text-white/30" onClick={() => handleClone(event.id)}>Clone</Button>
                      <Button variant="ghost" size="sm" className="text-red-300/50" onClick={() => handleDelete(event.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <p className="text-center py-8 text-sm text-white/30">No events found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminEvents;
