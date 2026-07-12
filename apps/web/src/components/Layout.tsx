import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@demp/ui';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/profile', label: 'Profile' },
    { to: '/events', label: 'Events' },
    { to: '/my-registrations', label: 'My Events' },
    ...(user?.role === 'ADMIN' ? [
      { to: '/admin', label: 'Overview' },
      { to: '/admin/events', label: 'Events' },
      { to: '/admin/qr-scanner', label: 'QR Scanner' },
    ] : []),
  ];

  return (
    <div className="min-h-safe">
      <header className="sticky top-0 z-40 bg-[#06060e]/80 backdrop-blur-[60px] border-b border-white/[0.03] safe-area-top">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="font-bold text-[#f5f5f5] text-lg tracking-tight shrink-0">DEMP</Link>
          <div className="flex items-center gap-1 min-w-0">
            <nav className="hidden sm:flex items-center gap-0.5 overflow-x-auto">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white/40 hover:text-[#f5f5f5] hover:bg-white/[0.05] transition-all whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </nav>
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 ml-2 shrink-0">
              <span className="text-xs font-medium text-white/30 max-w-[120px] truncate">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }} className="text-white/30 shrink-0">Sign Out</Button>
            </div>
            <button className="sm:hidden p-2 text-white/40 hover:text-white/70 min-w-[48px] min-h-[48px] flex items-center justify-center" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden border-t border-white/[0.03] px-4 py-2 space-y-0.5 bg-[#06060e]/95 backdrop-blur-[60px] max-h-[70vh] overflow-y-auto">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className="block text-sm text-white/50 hover:text-white/80 py-3 px-3 rounded-xl hover:bg-white/[0.04] min-h-[48px] flex items-center"
                onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
            <hr className="border-white/[0.04] my-2" />
            <p className="text-xs text-white/30 px-3 py-1 truncate">{user?.name}</p>
            <button className="text-sm text-red-300/70 hover:text-red-200 px-3 py-3 w-full text-left rounded-xl hover:bg-white/[0.04] min-h-[48px] flex items-center"
              onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8 safe-area-bottom">
        <Outlet />
      </main>
    </div>
  );
}

export { Layout };
