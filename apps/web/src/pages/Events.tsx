import { useState, useEffect, useCallback } from 'react';
import { Input, Spinner } from '@demp/ui';
import { EventCard } from '../components/EventCard';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Event, PaginatedResponse, Registration } from '../lib/types';

const SUB_CATEGORIES = ['QUIZ', 'DECODE', 'WPM', 'HACKATHON', 'WORKSHOP', 'CODING', 'CULTURAL', 'SPORTS', 'DEBATE', 'OTHER'];

function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegIds, setMyRegIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [customSub, setCustomSub] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (mainCategory) params.set('mainCategory', mainCategory);
    if (subCategory) params.set('subCategory', subCategory);
    if (customSub) params.set('subCategory', customSub);
    params.set('status', 'OPEN');

    Promise.all([
      api.get<PaginatedResponse<Event>>(`/events?${params}`),
      user ? api.get<Registration[]>('/me/registrations') : Promise.resolve([]),
    ])
      .then(([eventsRes, regs]) => {
        setEvents(eventsRes.data);
        setMyRegIds(new Set(regs.map((r) => r.eventId)));
      })
      .finally(() => setLoading(false));
  }, [search, mainCategory, subCategory, customSub, user]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRegister = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      await api.post(`/events/${eventId}/register`);
      setMyRegIds((prev) => new Set(prev).add(eventId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setActionLoading(null);
    }
  };

  const [showCustomInput, setShowCustomInput] = useState(false);
  const activeSub = subCategory || customSub;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] sm:text-[30px] font-bold text-[#f5f5f5] tracking-tight">Events</h1>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <select
          value={mainCategory}
          onChange={(e) => { setMainCategory(e.target.value); setSubCategory(''); setCustomSub(''); setShowCustomInput(false); }}
          className="h-11 w-full sm:w-40 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.25em 1.25em',
            paddingRight: '2.75rem',
          }}
        >
          <option value="" className="bg-[#06060e]">All Categories</option>
          <option value="TECHNICAL" className="bg-[#06060e]">Technical</option>
          <option value="NON_TECHNICAL" className="bg-[#06060e]">Non-Technical</option>
        </select>
        {mainCategory && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={activeSub}
              onChange={(e) => { if (e.target.value === '__custom__') { setShowCustomInput(true); setSubCategory(''); setCustomSub(''); } else { setSubCategory(e.target.value); setCustomSub(''); setShowCustomInput(false); } }}
              className="h-11 w-full sm:w-36 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm appearance-none px-4 focus-visible:outline-none focus-visible:border-primary-500/40"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em',
                paddingRight: '2.75rem',
              }}
            >
              <option value="" className="bg-[#06060e]">Subcategory</option>
              {SUB_CATEGORIES.map((sc) => (
                <option key={sc} value={sc} className="bg-[#06060e]">{sc}</option>
              ))}
              <option value="__custom__" className="bg-[#06060e]">+ Custom</option>
            </select>
            {showCustomInput && (
              <Input
                placeholder="Type custom..."
                value={customSub}
                onChange={(e) => setCustomSub(e.target.value)}
                className="w-full sm:w-28"
              />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/30 font-medium">No events found</p>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="animate-fade-in-up">
              <EventCard
                event={event}
                isRegistered={myRegIds.has(event.id)}
                onRegister={handleRegister}
                loading={actionLoading === event.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
