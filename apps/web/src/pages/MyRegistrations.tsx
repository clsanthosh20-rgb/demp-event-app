import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Spinner } from '@demp/ui';
import { api } from '../lib/api';
import type { Registration } from '../lib/types';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get<Registration[]>('/me/registrations')
      .then(setRegistrations)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const now = new Date();

  const upcoming = registrations.filter((r) => new Date(r.event.date) >= now);
  const completed = registrations.filter((r) => new Date(r.event.date) < now);

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-[22px] sm:text-[30px] font-bold text-[#f5f5f5] tracking-tight">My Registrations</h1>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Upcoming Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((reg) => (
              <Card key={reg.id} className="animate-fade-in-up">
                <CardContent className="space-y-3">
                  {reg.event.imageUrl && (
                    <div className="-mx-5 -mt-4 mb-3 rounded-t-[1.25rem] overflow-hidden aspect-[2/1]">
                      <img src={reg.event.imageUrl} alt={reg.event.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <h3 className="font-semibold text-[#f5f5f5] text-[16px]">{reg.event.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white/40">
                    <span>{new Date(reg.event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>{new Date(reg.event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{reg.event.location}</span>
                    {reg.event.roomNumber && <span>Room {reg.event.roomNumber}</span>}
                  </div>
                  {reg.qrCodeUrl && (
                    <div className="flex justify-center py-2">
                      <img src={reg.qrCodeUrl} alt="QR Code" className="w-32 h-32 rounded-xl bg-white p-2" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-[11px] text-white/30 font-mono tracking-wider">{reg.uniqueRegistrationId}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a href={`/api/v1/registrations/${reg.id}/pass`} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Download Pass
                      </Button>
                    </a>
                    {reg.checkedIn && (
                      <Badge variant="success" className="self-center">Checked In</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Past Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((reg) => (
              <Card key={reg.id} className="opacity-60">
                <CardContent className="space-y-2">
                  <h3 className="font-medium text-[#f5f5f5] text-[15px]">{reg.event.title}</h3>
                  <div className="text-[12px] text-white/40">
                    <span>{new Date(reg.event.date).toLocaleDateString()}</span>
                    <span className="ml-3">{reg.event.location}</span>
                  </div>
                  <div className="flex gap-2 items-center pt-1">
                    <Badge variant={reg.checkedIn ? 'success' : 'default'}>
                      {reg.checkedIn ? 'Attended' : 'Registered'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {registrations.length === 0 && (
        <Card><CardContent><p className="text-sm text-white/30">You haven't registered for any events yet.</p></CardContent></Card>
      )}
    </div>
  );
}

export default MyRegistrations;
