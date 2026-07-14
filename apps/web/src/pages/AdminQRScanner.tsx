import { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Card, CardContent, Badge, Spinner } from '@demp/ui';
import { api } from '../lib/api';

interface VerificationResult {
  id: string;
  uniqueRegistrationId: string;
  status: string;
  checkedIn: boolean;
  checkInTime: string | null;
  checkInAdminId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    yearOfStudy: string | null;
    class: string | null;
    section: string | null;
  };
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    roomNumber: string | null;
  };
}

type CameraError = 'not-supported' | 'https-required' | 'no-device' | 'permission-denied' | 'not-found' | 'start-failed' | 'timeout';

const CAMERA_TIMEOUT_MS = 15_000;

function AdminQRScanner() {
  const [inputCode, setInputCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelledRef = useRef(false);

  const stopCamera = useCallback(() => {
    cancelledRef.current = true;
    setCameraActive(false);
    setCameraError(null);
    setScanning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleVerify = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setVerifying(true);
    setError('');
    setResult(null);
    setCheckedIn(false);
    try {
      const data = await api.get<VerificationResult>(`/registrations/verify/${code.trim()}`);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }, []);

  const scanLoop = useCallback(() => {
    if (cancelledRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA || !video.videoWidth) {
      animationRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    import('jsqr').then((jsQR) => {
      if (cancelledRef.current) return;
      const code = jsQR.default(imageData.data, imageData.width, imageData.height);
      if (code) {
        const value = code.data;
        let registrationId = '';

        try {
          const parsed = JSON.parse(value);
          registrationId = parsed.registrationId || parsed.uniqueRegistrationId || parsed.id || '';
        } catch {
          registrationId = value.trim();
        }

        if (registrationId && (registrationId.startsWith('DEMP-') || registrationId.length >= 8)) {
          stopCamera();
          handleVerify(registrationId);
          return;
        }
      }
      animationRef.current = requestAnimationFrame(scanLoop);
    });
  }, [stopCamera, handleVerify]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScanning(false);
    setResult(null);
    setError('');
    cancelledRef.current = false;

    console.log('secure', window.isSecureContext);
    console.log('mediaDevices', !!navigator.mediaDevices);
    console.log('getUserMedia', !!navigator.mediaDevices?.getUserMedia);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraError('not-supported');
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('devices', devices);
    } catch {
      console.log('devices', []);
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
    } catch (e) {
      if (e instanceof DOMException) {
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setCameraError('permission-denied');
        } else if (e.name === 'NotFoundError') {
          setCameraError('not-found');
        } else {
          setCameraError('start-failed');
        }
      } else {
        setCameraError('start-failed');
      }
      return;
    }

    streamRef.current = stream;

    const videoEl = videoRef.current;
    if (!videoEl) {
      stream.getTracks().forEach((t) => t.stop());
      setCameraError('not-supported');
      return;
    }

    videoEl.srcObject = stream;

    try {
      await videoEl.play();
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraError('permission-denied');
      return;
    }

    setCameraActive(true);
    setScanning(true);
    animationRef.current = requestAnimationFrame(scanLoop);

    timeoutRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      const videoCheck = videoRef.current;
      if (!videoCheck || videoCheck.readyState < videoCheck.HAVE_CURRENT_DATA || !videoCheck.videoWidth) {
        stopCamera();
        setCameraError('timeout');
      }
    }, CAMERA_TIMEOUT_MS);
  }, [scanLoop, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCheckIn = async () => {
    if (!result) return;
    setCheckingIn(true);
    try {
      await api.post('/registrations/check-in', { registrationId: result.id });
      setCheckedIn(true);
      setResult((prev) => prev ? { ...prev, checkedIn: true, checkInTime: new Date().toISOString() } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const cameraErrorMessages: Record<CameraError, string> = {
    'not-supported': 'Camera access is not supported on this device or browser. Use manual entry below.',
    'https-required': 'Camera access requires a secure connection (HTTPS). Use manual entry below.',
    'no-device': 'No camera device found on this system. Use manual entry below.',
    'permission-denied': 'Camera permission was denied. Please allow camera access in your browser settings, then try again. Manual entry is still available below.',
    'not-found': 'No camera found on this device. Use manual entry below.',
    'start-failed': 'Failed to start the camera. Use manual entry below.',
    'timeout': 'Camera is taking too long to start. Try again or use manual entry below.',
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#f5f5f5] tracking-tight">QR Scanner</h1>
        <p className="text-sm text-white/40 mt-1">Verify event registrations</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-white/50 tracking-tight">Camera Scanner</h2>
            {!cameraActive ? (
              <Button onClick={startCamera} size="sm" variant="outline" disabled={verifying}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} size="sm" variant="ghost" className="text-red-300/70">
                Stop Camera
              </Button>
            )}
          </div>

          <div className={`relative rounded-2xl overflow-hidden bg-black border border-white/[0.07] ${!cameraActive ? 'hidden' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {cameraActive && scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary-500/60 rounded-xl animate-pulse" />
              </div>
            )}
            {cameraActive && !scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          {cameraError && (
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-300">Camera Error</p>
                <p className="text-xs text-white/50 mt-0.5">{cameraErrorMessages[cameraError]}</p>
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.06] pt-4 space-y-2">
            <label className="text-sm font-medium text-white/60">Or Enter Registration ID Manually</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify(inputCode)}
                placeholder="e.g. DEMP-2026-004531"
                className="flex-1 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/70 placeholder:text-white/25 px-4 text-sm focus-visible:outline-none focus-visible:border-primary-500/40"
              />
              <Button onClick={() => handleVerify(inputCode)} loading={verifying}>Verify</Button>
            </div>
            <p className="text-[11px] text-white/25">
              Paste the registration ID scanned from the student's QR code
            </p>
          </div>
        </CardContent>
      </Card>

      {verifying && (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      )}

      {error && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-300">Not Found</p>
                <p className="text-xs text-white/40">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={`animate-scale-in ${result.checkedIn ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f5f5f5]">Registration Details</h2>
              {result.checkedIn ? (
                <Badge variant="warning">Already Checked In</Badge>
              ) : (
                <Badge variant="success">Not Checked In</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-white/30 text-[11px]">Registration ID</p>
                <p className="text-primary-300 font-mono font-medium text-[13px]">{result.uniqueRegistrationId}</p>
              </div>
              <div>
                <p className="text-white/30 text-[11px]">Status</p>
                <p className="text-white/70">{result.status}</p>
              </div>
            </div>

            <div className="border-t border-white/[0.04] pt-4 space-y-2">
              <h3 className="text-sm font-medium text-white/50">Student Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-white/30 text-[11px]">Name</p><p className="text-white/80">{result.user.name}</p></div>
                <div><p className="text-white/30 text-[11px]">Email</p><p className="text-white/50 text-[12px]">{result.user.email}</p></div>
                <div><p className="text-white/30 text-[11px]">Department</p><p className="text-white/70">{result.user.department || '—'}</p></div>
                <div><p className="text-white/30 text-[11px]">Year</p><p className="text-white/70">{result.user.yearOfStudy || '—'}</p></div>
              </div>
            </div>

            <div className="border-t border-white/[0.04] pt-4 space-y-2">
              <h3 className="text-sm font-medium text-white/50">Event Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2"><p className="text-white/30 text-[11px]">Event</p><p className="text-white/80">{result.event.title}</p></div>
                <div><p className="text-white/30 text-[11px]">Date</p><p className="text-white/70">{new Date(result.event.date).toLocaleDateString()}</p></div>
                <div><p className="text-white/30 text-[11px]">Location</p><p className="text-white/70">{result.event.location}{result.event.roomNumber ? `, Room ${result.event.roomNumber}` : ''}</p></div>
              </div>
            </div>

            {result.checkedIn && result.checkInTime && (
              <div className="border-t border-white/[0.04] pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-yellow-300/80">Checked in at {new Date(result.checkInTime).toLocaleString()}</span>
                </div>
              </div>
            )}

            {!result.checkedIn && !checkedIn && (
              <Button onClick={handleCheckIn} loading={checkingIn} className="w-full" size="lg">
                Confirm Check-In
              </Button>
            )}

            {checkedIn && (
              <div className="text-center py-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-300 font-semibold">Check-In Successful</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminQRScanner;
