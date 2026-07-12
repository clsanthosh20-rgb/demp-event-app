import { useState, useEffect } from 'react';
import { Card, CardContent, Spinner, Button } from '@demp/ui';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import type { Event, PaginatedResponse, Registration } from '../lib/types';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<Event>>('/events?limit=6&status=OPEN'),
      api.get<Registration[]>('/me/registrations'),
    ])
      .then(([eventsRes, regs]) => {
        setUpcoming(eventsRes.data);
        setMyRegistrations(regs);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcomingRegs = myRegistrations.filter((r) => new Date(r.event.date) >= now).slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="animate-fade-in-up">
        <h1 className="text-[22px] sm:text-[30px] font-bold text-[#f5f5f5] tracking-tight leading-tight break-words">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-white/40 font-medium">
          {user?.department || 'No department'} &middot; {user?.role}
        </p>
      </section>

      {upcomingRegs.length > 0 && (
        <section className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Your Upcoming Events</h2>
            <Link to="/my-registrations" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingRegs.map((reg) => (
              <Card key={reg.id}>
                <CardContent className="space-y-2">
                  {reg.event.imageUrl && (
                    <div className="-mx-5 -mt-4 mb-2 rounded-t-[1.25rem] overflow-hidden aspect-[2/1]">
                      <img src={reg.event.imageUrl} alt={reg.event.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <h3 className="font-semibold text-[#f5f5f5] text-[15px]">{reg.event.title}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                    <span>{new Date(reg.event.date).toLocaleDateString()}</span>
                    <span>{reg.event.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Open Events</h2>
          <Link to="/events" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : upcoming.length === 0 ? (
          <Card><CardContent><p className="text-sm text-white/30">No open events right now</p></CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
