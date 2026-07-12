import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, Input, Label, Spinner } from '@demp/ui';
import { api } from '../lib/api';
import type { Event } from '../lib/types';

const SUB_OPTIONS = ['QUIZ', 'DECODE', 'WPM', 'HACKATHON', 'WORKSHOP', 'CODING', 'CULTURAL', 'SPORTS', 'DEBATE'];

const statuses = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invitation, setInvitation] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [reportingTime, setReportingTime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [capacity, setCapacity] = useState('');
  const [mainCategory, setMainCategory] = useState<'TECHNICAL' | 'NON_TECHNICAL'>('TECHNICAL');
  const [subCategory, setSubCategory] = useState('OTHER');
  const [customSub, setCustomSub] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<Event>(`/events/${id}`).then((event) => {
      setTitle(event.title);
      setDescription(event.description);
      setInvitation(event.invitation || '');
      setDate(new Date(event.date).toISOString().slice(0, 16));
      setLocation(event.location);
      setRoomNumber(event.roomNumber || '');
      setReportingTime(event.reportingTime || '');
      setRegistrationDeadline(event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '');
      setCapacity(String(event.capacity));
      setMainCategory(event.mainCategory as 'TECHNICAL' | 'NON_TECHNICAL');
      setSubCategory(event.subCategory);
      setStatus(event.status);
      setImageUrl(event.imageUrl || '');
    }).catch(() => navigate('/admin/events'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const selCategory = subCategory === '__custom__' ? customSub || 'OTHER' : subCategory;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await api.upload<{ url: string }>('/upload/image', formData);
      setImageUrl(result.url);
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title, description, invitation: invitation || null, location, status,
        mainCategory, subCategory: selCategory,
        date: new Date(date).toISOString(),
        capacity: Number(capacity),
        imageUrl: imageUrl || null,
      };
      if (roomNumber) body.roomNumber = roomNumber;
      if (reportingTime) body.reportingTime = reportingTime;
      if (registrationDeadline) body.registrationDeadline = new Date(registrationDeadline).toISOString();

      if (isEdit) {
        await api.put(`/events/${id}`, body);
      } else {
        await api.post('/events', body);
      }
      navigate('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <h1 className="text-[20px] sm:text-[24px] font-bold text-[#f5f5f5] tracking-tight">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-300 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/10 font-medium">{error}</p>}

          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
              <img src={imageUrl} alt="Event cover" className="w-full aspect-[2/1] object-cover" />
              <button type="button" onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white/70 hover:text-white flex items-center justify-center text-sm">
                &times;
              </button>
            </div>
          )}

          <div>
            <Label>Event Cover Image</Label>
            <div className="mt-1.5">
              <label className="flex items-center justify-center h-24 rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] cursor-pointer hover:border-primary-500/30 transition-colors">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-xs text-white/30 mt-1">{uploading ? 'Uploading...' : 'Upload Image'}</p>
                </div>
                <input type="file" accept="image/png,image/jpg,image/jpeg,image/webp" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reportingTime">Reporting Time</Label>
              <Input id="reportingTime" type="text" value={reportingTime} onChange={(e) => setReportingTime(e.target.value)} placeholder="e.g. 9:00 AM" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. 301, Lab 4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min={1} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input id="registrationDeadline" type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Main Category</Label>
              <select value={mainCategory} onChange={(e) => setMainCategory(e.target.value as any)}
                className="h-11 w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 focus-visible:outline-none focus-visible:border-primary-500/40 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem',
                }}>
                <option value="TECHNICAL" className="bg-[#06060e]">Technical</option>
                <option value="NON_TECHNICAL" className="bg-[#06060e]">Non-Technical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <select value={subCategory} onChange={(e) => { setSubCategory(e.target.value); if (e.target.value !== '__custom__') setCustomSub(''); }}
                className="h-11 w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 focus-visible:outline-none focus-visible:border-primary-500/40 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem',
                }}>
                {SUB_OPTIONS.map((s) => (<option key={s} value={s} className="bg-[#06060e]">{s}</option>))}
                <option value="__custom__" className="bg-[#06060e]">+ Custom</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Custom Sub</Label>
              <Input value={customSub} onChange={(e) => setCustomSub(e.target.value)} placeholder={subCategory === '__custom__' ? 'Type...' : 'Select custom'} disabled={subCategory !== '__custom__'} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 text-sm px-4 focus-visible:outline-none focus-visible:border-primary-500/40 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.75rem',
                }}>
                {statuses.map((s) => (<option key={s.value} value={s.value} className="bg-[#06060e]">{s.label}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[100px] w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 placeholder:text-white/25 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-primary-500/40 resize-none" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invitation">Invitation / Rules (no text limit)</Label>
            <textarea id="invitation" value={invitation} onChange={(e) => setInvitation(e.target.value)}
              className="flex min-h-[160px] w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 placeholder:text-white/25 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-primary-500/40 resize-y font-mono"
              placeholder="Write invitation text, rules, schedule, special notes..." />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" loading={saving}>{isEdit ? 'Update Event' : 'Create Event'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/events')}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default EventForm;
