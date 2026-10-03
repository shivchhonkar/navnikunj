'use client';

import { useEffect } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import type { DonationReceipt } from '@/lib/types';

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const rows = (receipt: DonationReceipt) => [
  ['Donor', receipt.name],
  ['Email', receipt.email],
  ['Phone', receipt.phone],
  ['PAN', receipt.pan],
  ['Address', receipt.address],
  ['Country', receipt.country],
  ['Amount', `₹${receipt.amount.toLocaleString('en-IN')}`],
  ['Date and time', when(receipt.at)],
  ['Payment ID', receipt.paymentId || '—'],
  ['Payment mode', receipt.method || '—'],
];

export function DonateReceipt({ receipt, onClose }: { receipt: DonationReceipt; onClose: () => void }) {
  const paid = receipt.status === 'paid';

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-receipt-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {paid ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={28} aria-hidden /> : <XCircle className="mt-0.5 shrink-0 text-red-700" size={28} aria-hidden />}
            <div>
              <h2 id="donate-receipt-title" className="text-2xl text-ink">{paid ? 'Thank you' : 'Payment not completed'}</h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">{receipt.message}</p>
            </div>
          </div>
          <button type="button" className="rounded-full p-1 text-stone-500 hover:bg-sand hover:text-ink" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <dl className="mt-5 divide-y divide-stone-100 rounded-xl border border-stone-200">
          {rows(receipt).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-2.5 text-sm">
              <dt className="text-stone-500">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="btn btn-brand mt-5 w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
