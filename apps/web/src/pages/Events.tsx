import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Input, Spinner, Button, Card, CardContent } from '@demp/ui';
import { EventCard } from '../components/EventCard';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Event, PaginatedResponse, Registration } from '../lib/types';

interface RegistrationResult {
  id: string;
  uniqueRegistrationId: string;
  qrCodeUrl: string | null;
  event: Event;
}

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
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

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
      const result = await api.post<RegistrationResult>(`/events/${eventId}/register`);
      setMyRegIds((prev) => new Set(prev).add(eventId));
      setRegistrationResult(result);
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

      {registrationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRegistrationResult(null)}>
          <Card className="w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#f5f5f5]">Registration Confirmed</h2>
                <p className="text-sm text-white/40 mt-1">{registrationResult.event.title}</p>
              </div>

              <div className="bg-white/[0.03] rounded-2xl p-4 space-y-2">
                <div className="text-center">
                  <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">Registration ID</p>
                  <p className="text-primary-300 font-mono font-semibold text-[18px] tracking-wider mt-1">{registrationResult.uniqueRegistrationId}</p>
                </div>
                {registrationResult.qrCodeUrl && (
                  <div className="flex justify-center pt-2">
                    <img src={registrationResult.qrCodeUrl} alt="QR Code" className="w-36 h-36 rounded-xl bg-white p-2" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link to="/my-registrations" className="flex-1" onClick={() => setRegistrationResult(null)}>
                  <Button variant="outline" className="w-full">View My Registrations</Button>
                </Link>
                <Button onClick={() => setRegistrationResult(null)} className="flex-1">Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Events;
