import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Spinner } from '@demp/ui';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const MyRegistrations = lazy(() => import('./pages/MyRegistrations'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEventDetail = lazy(() => import('./pages/AdminEventDetail'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const EventForm = lazy(() => import('./pages/EventForm'));
const AdminQRScanner = lazy(() => import('./pages/AdminQRScanner'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <div className="relative min-h-safe overflow-x-hidden">
      <div className="bg-glow bg-glow-1 animate-float" />
      <div className="bg-glow bg-glow-2 animate-float" style={{ animationDelay: '-3s' }} />
      <div className="bg-glow bg-glow-3 animate-pulse-glow" />
      <div className="bg-grid fixed inset-0 z-0 pointer-events-none" />
      <div className="relative z-10">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
              <Route path="/register" element={<SuspenseWrapper><Register /></SuspenseWrapper>} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<SuspenseWrapper><Dashboard /></SuspenseWrapper>} />
                <Route path="/events" element={<SuspenseWrapper><Events /></SuspenseWrapper>} />
                <Route path="/my-registrations" element={<SuspenseWrapper><MyRegistrations /></SuspenseWrapper>} />
                <Route path="/notifications" element={<SuspenseWrapper><Notifications /></SuspenseWrapper>} />
                <Route path="/profile" element={<SuspenseWrapper><Profile /></SuspenseWrapper>} />
              </Route>
              <Route element={<ProtectedRoute roles={['ADMIN']}><Layout /></ProtectedRoute>}>
                <Route path="/admin" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
                <Route path="/admin/events" element={<SuspenseWrapper><AdminEvents /></SuspenseWrapper>} />
                <Route path="/admin/events/new" element={<SuspenseWrapper><EventForm /></SuspenseWrapper>} />
                <Route path="/admin/events/:id/edit" element={<SuspenseWrapper><EventForm /></SuspenseWrapper>} />
                <Route path="/admin/events/:id" element={<SuspenseWrapper><AdminEventDetail /></SuspenseWrapper>} />
                <Route path="/admin/qr-scanner" element={<SuspenseWrapper><AdminQRScanner /></SuspenseWrapper>} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
