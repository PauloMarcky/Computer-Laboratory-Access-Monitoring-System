import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

// One endpoint: Express runs OCR (Python worker) and looks the student up in students.csv
const SCAN_IMAGE_URL = 'http://localhost:3000/api/v1/attendance/scan-image';
const SCAN_INTERVAL_MS = 700;
const COOLDOWN_MS = 4000; // don't re-scan the same ID immediately
const FEEDBACK_MS = 2800; // how long the result overlay stays on screen

interface CameraScannerProps {
  active: boolean;
  // return 'duplicate' (+ original timeIn) if already logged, otherwise 'added'
  onMatched: (student: MatchedStudent) => { result: 'added' | 'duplicate'; timeIn?: string } | void;
}

export interface MatchedStudent {
  studentId: string;
  studentName: string;
  formalName?: string;
  course?: string;
  yearLevel?: string;
  timeIn: string;
}

type Feedback = {
  type: 'success' | 'duplicate' | 'nomatch' | 'error';
  title: string;
  detail?: string;
  name?: string;
  studentId?: string;
  course?: string;
  timeIn?: string;
};

/* ------------------------------------------------------------------ */
/* Error boundary: a scanner crash must never blank the instructor view */
/* ------------------------------------------------------------------ */
class ScannerBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error('[CameraScanner] crashed:', err);
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="w-full h-60 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 flex flex-col items-center justify-center p-4 text-center">
          <CameraOff className="w-8 h-8 mb-2 text-rose-400" />
          <span className="text-xs text-rose-600 font-semibold">Scanner unavailable</span>
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="mt-2 text-[11px] text-[#1b325f] underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
const CameraScannerInner: React.FC<CameraScannerProps> = ({ active, onMatched }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const busyRef = useRef(false);
  const recentRef = useRef<Map<string, number>>(new Map());
  const onMatchedRef = useRef(onMatched);
  onMatchedRef.current = onMatched;

  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [status, setStatus] = useState('Align Student ID inside the frame');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackRef = useRef<Feedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = (f: Feedback) => {
    feedbackRef.current = f;
    setFeedback(f);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      feedbackRef.current = null;
      setFeedback(null);
      setStatus('Align Student ID inside the frame');
    }, FEEDBACK_MS);
  };

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  // Start / stop camera
  useEffect(() => {
    if (!active) {
      setCameraReady(false);
      return;
    }

    // navigator.mediaDevices is undefined on plain http:// (non-localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(`Camera is blocked on ${window.location.origin}. Open this page via http://localhost:${window.location.port || 80} instead.`);
      return;
    }

    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          v.play().catch(() => { });
        }
        setError(null);
        setCameraReady(true);
      })
      .catch((e: unknown) => {
        const name = (e as { name?: string })?.name;
        setError(
          name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in the browser.'
            : name === 'NotFoundError'
              ? 'No camera found.'
              : name === 'NotReadableError'
                ? 'Camera is in use by another app.'
                : 'Cannot access camera.'
        );
      });

    return () => {
      cancelled = true;
      setCameraReady(false);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  // Scan loop
  useEffect(() => {
    if (!active || !cameraReady) return;

    const tick = async () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || busyRef.current || feedbackRef.current) return;
      busyRef.current = true;

      try {
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
        const canvas = canvasRef.current;

        // Crop same ROI as the on-screen box (x 10-90%, y 20-80%)
        const sx = video.videoWidth * 0.1;
        const sy = video.videoHeight * 0.2;
        const sw = video.videoWidth * 0.8;
        const sh = video.videoHeight * 0.6;
        canvas.width = sw;
        canvas.height = sh;
        canvas.getContext('2d')!.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob(res, 'image/jpeg', 0.85)
        );
        if (!blob) return;

        // Send the cropped frame to Express (OCR + student lookup happen there)
        let apiRes: Response;
        try {
          apiRes = await fetch(SCAN_IMAGE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            body: blob,
          });
        } catch {
          showFeedback({
            type: 'error',
            title: 'Server Unreachable',
            detail: 'Express API is offline (port 3000)',
          });
          return;
        }

        if (!apiRes.ok) {
          let serverMsg = '';
          try {
            serverMsg = (await apiRes.json()).message || '';
          } catch {
            /* response was not JSON */
          }
          if (apiRes.status === 503) {
            // OCR worker still starting or failed: keep trying quietly
            setStatus(serverMsg ? `Scanner not ready: ${serverMsg}` : 'Scanner starting…');
            return;
          }
          showFeedback({
            type: 'error',
            title: `Server Error (${apiRes.status})`,
            detail:
              serverMsg ||
              (apiRes.status === 404
                ? 'Route /api/v1/attendance/scan-image not found. Update server.js and attendance-routes.js.'
                : 'Could not process the scan'),
          });
          return;
        }

        const data = await apiRes.json();
        if (!data.detected) {
          setStatus('Align Student ID inside the frame');
          return;
        }

        const scannedId: string = data.scannedId;
        const last = recentRef.current.get(scannedId) ?? 0;
        if (Date.now() - last < COOLDOWN_MS) return;
        recentRef.current.set(scannedId, Date.now());

        if (data.matched === true) {
          const student: MatchedStudent = {
            studentId: data.studentId,
            studentName: data.studentName,
            formalName: data.formalName,
            course: data.course,
            yearLevel: data.yearLevel,
            timeIn: data.timeIn,
          };
          const outcome = onMatchedRef.current(student);
          const dup = outcome && outcome.result === 'duplicate';
          showFeedback({
            type: dup ? 'duplicate' : 'success',
            title: dup ? 'Already Logged' : 'Attendance Recorded',
            name: student.studentName,
            studentId: student.studentId,
            course: student.course,
            timeIn: dup && outcome?.timeIn ? outcome.timeIn : student.timeIn,
          });
        } else {
          showFeedback({
            type: 'nomatch',
            title: 'ID Not Recognized',
            detail: `${scannedId} is not in the student list`,
          });
        }
      } catch (e) {
        console.error('[CameraScanner] tick error:', e);
      } finally {
        busyRef.current = false;
      }
    };

    const id = setInterval(tick, SCAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active, cameraReady]);

  if (!active) {
    return (
      <div className="w-full h-60 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 opacity-60 flex flex-col items-center justify-center">
        <CameraOff className="w-8 h-8 mb-2 text-slate-400" />
        <span className="text-[11px] text-slate-400">
          Resume class session to enable scanning
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full h-60 rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute border-2 rounded pointer-events-none transition-colors ${feedback?.type === 'success'
              ? 'border-emerald-400'
              : feedback?.type === 'duplicate'
                ? 'border-amber-400'
                : feedback
                  ? 'border-rose-400'
                  : 'border-white/70'
            }`}
          style={{ left: '10%', right: '10%', top: '20%', bottom: '20%' }}
        />
        {feedback && (
          <div
            className={`absolute inset-x-0 bottom-0 px-4 py-3 flex items-center gap-3 text-white ${feedback.type === 'success'
                ? 'bg-emerald-600/95'
                : feedback.type === 'duplicate'
                  ? 'bg-amber-500/95'
                  : 'bg-rose-600/95'
              }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-7 h-7 shrink-0" />
            ) : feedback.type === 'duplicate' ? (
              <AlertTriangle className="w-7 h-7 shrink-0" />
            ) : (
              <XCircle className="w-7 h-7 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
                {feedback.title}
              </div>
              {feedback.name && (
                <div className="text-base font-bold leading-tight truncate">{feedback.name}</div>
              )}
              {feedback.studentId && (
                <div className="text-xs opacity-95 truncate">
                  {feedback.studentId}
                  {feedback.course ? ` · ${feedback.course}` : ''}
                </div>
              )}
              {feedback.timeIn && (
                <div className="text-xs font-semibold mt-0.5">Time In: {feedback.timeIn}</div>
              )}
              {feedback.detail && (
                <div className="text-xs opacity-95 truncate">{feedback.detail}</div>
              )}
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs text-white p-4 text-center">
            {error}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Camera className="w-3.5 h-3.5 shrink-0" />
        <span>{status}</span>
      </div>
    </div>
  );
};

export const CameraScanner: React.FC<CameraScannerProps> = (props) => (
  <ScannerBoundary>
    <CameraScannerInner {...props} />
  </ScannerBoundary>
);