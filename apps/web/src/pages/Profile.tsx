import { useState } from 'react';
import { Button, Card, CardContent, Input, Label, Spinner } from '@demp/ui';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import type { User } from '../lib/types';

function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [cls, setCls] = useState(user?.class || '');
  const [section, setSection] = useState(user?.section || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const validatePhone = (value: string): string => {
    if (!value) return '';
    if (!/^\d{10}$/.test(value)) return 'Phone number must be exactly 10 digits';
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    setPhoneError(validatePhone(raw));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneErr = validatePhone(phone);
    if (phoneErr) { setPhoneError(phoneErr); return; }
    setSaving(true);
    try {
      const updated = await api.put<User>('/auth/profile', { name, phone: phone || undefined, class: cls || undefined, section: section || undefined, yearOfStudy: yearOfStudy || undefined, department: department || undefined });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-7">
      <h1 className="text-[22px] sm:text-[28px] font-bold text-white/90 tracking-tight">Profile</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <p className="text-sm text-white/40 py-2.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">{user.email}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (WhatsApp)</Label>
                <Input id="phone" type="text" inputMode="numeric" value={phone} onChange={handlePhoneChange} className={phoneError ? 'border-red-500/40 focus-visible:border-red-500/40' : ''} />
                {phoneError && <p className="text-xs text-red-300 font-medium">{phoneError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year of Study</Label>
                <Input id="year" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="class">Class</Label>
                <Input id="class" value={cls} onChange={(e) => setCls(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="section">Section</Label>
                <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dept">Department</Label>
                <Input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>
            <Button type="submit" loading={saving}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-[17px] font-semibold text-white/50 tracking-tight">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="text-sm text-red-300 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/10 font-medium">{passwordError}</div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" loading={passwordSaving}>
              {passwordSaved ? 'Updated!' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
