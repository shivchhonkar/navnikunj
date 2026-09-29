'use client';

import { CircleCheck, CircleX, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type AdminNoticeState = { tone: 'success' | 'error'; message: string } | null;

export function notifyAdmin(tone: 'success' | 'error', message: string) {
  window.dispatchEvent(new CustomEvent('admin-notice', { detail: { tone, message } }));
}

export function clearAdminNotice() {
  window.dispatchEvent(new CustomEvent('admin-notice-clear'));
}

export function useAdminNotice() {
  const [notice, setNotice] = useState<AdminNoticeState>(null);
  const timer = useRef<number | undefined>(undefined);

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    setNotice(null);
  }, []);

  const show = useCallback((tone: 'success' | 'error', message: string) => {
    window.clearTimeout(timer.current);
    setNotice({ tone, message });
    if (tone === 'success') timer.current = window.setTimeout(() => setNotice(null), 6000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { notice, show, clear };
}

export function useDeskNotice() {
  return { show: notifyAdmin, clear: clearAdminNotice };
}

export function AdminNotice({ notice, onClose, offset = true, shiftClass }: { notice: AdminNoticeState; onClose: () => void; offset?: boolean; shiftClass?: string }) {
  if (!notice) return null;
  const success = notice.tone === 'success';
  const place = shiftClass || (offset ? 'top-20 lg:left-64' : 'top-4');
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 ${place}`} role={success ? 'status' : 'alert'} aria-live="assertive">
      <div className={`pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg ${success ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-red-300 bg-red-50 text-red-950'}`}>
        {success
          ? <CircleCheck className="mt-0.5 shrink-0 text-emerald-700" size={22} strokeWidth={1.75} aria-hidden />
          : <CircleX className="mt-0.5 shrink-0 text-red-700" size={22} strokeWidth={1.75} aria-hidden />}
        <p className="flex-1 text-sm font-semibold leading-6">{notice.message}</p>
        <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-black/5" aria-label="Dismiss alert">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
