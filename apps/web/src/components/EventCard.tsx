import { useState } from 'react';
import { Badge, Button } from '@demp/ui';
import type { Event } from '../lib/types';

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect fill="#1a1a2e" width="800" height="400"/><g transform="translate(400,200)"><circle cx="0" cy="-30" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/><path d="M-40 60 L40 60 L30 20 L-30 20 Z" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/><path d="M-50 80 L50 80" stroke="rgba(255,255,255,0.06)" stroke-width="2"/></g><text x="400" y="340" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="sans-serif" font-size="14">No Image Available</text></svg>'
);

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  onRegister?: (eventId: string) => void;
  loading?: boolean;
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  OPEN: 'success',
  CLOSED: 'danger',
  DRAFT: 'default',
  CANCELLED: 'danger',
};

function EventCard({ event, isRegistered, onRegister, loading }: EventCardProps) {
  const [imgError, setImgError] = useState(false);
  const date = new Date(event.date);
  const full = event._count.registrations >= event.capacity;
  const remaining = event.capacity - event._count.registrations;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const showImage = event.imageUrl && !imgError;

  return (
    <div className="group rounded-[1.75rem] bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 animate-fade-in-up">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0a1a]">
        {showImage ? (
          <img
            src={event.imageUrl!}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={PLACEHOLDER_IMG}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060e] via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={statusColors[event.status] || 'default'}>{event.status}</Badge>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-[#f5f5f5] text-[18px] leading-tight line-clamp-1">{event.title}</h3>
          <span className="text-[11px] font-medium text-white/30">
            {event.mainCategory === 'TECHNICAL' ? 'Technical' : 'Non-Technical'} &middot; {event.subCategory}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-white/50">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formattedTime}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-white/50">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {event.location}
            {event.roomNumber && <span className="text-white/30"> &middot; Room {event.roomNumber}</span>}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-primary-300">
                {event.createdBy.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] text-white/40 font-medium leading-tight truncate">by {event.createdBy.name}</p>
              <p className="text-[11px] text-white/25">{event._count.registrations}/{event.capacity} registered</p>
            </div>
          </div>
          <div className="shrink-0">
            {event.status === 'OPEN' ? (
              isRegistered ? (
                <Button variant="outline" size="sm" className="text-green-400/80 border-green-500/20 hover:bg-green-500/10 cursor-default" disabled>
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Registered
                </Button>
              ) : full ? (
                <Button size="sm" disabled className="opacity-60">
                  Event Full
                </Button>
              ) : (
                <Button size="sm" onClick={() => onRegister?.(event.id)} loading={loading}>
                  Register Now
                </Button>
              )
            ) : (
              <Button size="sm" disabled variant="outline" className="opacity-50">
                {event.status === 'CLOSED' ? 'Registration Closed' : event.status === 'CANCELLED' ? 'Cancelled' : 'Unavailable'}
              </Button>
            )}
          </div>
        </div>

        {event.status === 'OPEN' && !full && !isRegistered && (
          <p className="text-[12px] text-primary-300/60 font-medium text-center -mt-1">
            {remaining} slot{remaining !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>
    </div>
  );
}

export { EventCard };
