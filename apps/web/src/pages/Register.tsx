import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Card, CardContent, Input, Label } from '@demp/ui';
import { useAuth } from '../hooks/useAuth';

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

function Register() {
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneErr = validatePhone(phone);
    if (phoneErr) { setPhoneError(phoneErr); return; }
    setError('');
    setLoading(true);
    try {
      await register({
        email, password, name,
        phone: phone || undefined,
        class: cls || undefined,
        section: section || undefined,
        yearOfStudy: yearOfStudy || undefined,
        department: department || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90 tracking-tight">DEMP</h1>
          <p className="text-xs sm:text-sm text-white/30 font-medium">Create your account</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/10 font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg hover:bg-white/5 transition-colors">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                <Input id="phone" type="text" inputMode="numeric" value={phone} onChange={handlePhoneChange} placeholder="9876543210" className={phoneError ? 'border-red-500/40 focus-visible:border-red-500/40' : ''} />
                {phoneError && <p className="text-xs text-red-300 font-medium">{phoneError}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="class">Class</Label>
                  <Input id="class" value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. III" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="section">Section</Label>
                  <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} placeholder="e.g. 3rd Year" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <Button type="submit" loading={loading} className="w-full">Create Account</Button>
              <p className="text-center text-sm text-white/30 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-300 hover:text-primary-200">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Register;
