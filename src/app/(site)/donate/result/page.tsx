import type { Metadata } from 'next';
import Link from 'next/link';
import { confirmCashfreeOrder } from '@/lib/cashfree';

export const metadata: Metadata = { title: 'Donation', robots: { index: false, follow: false } };

export default async function DonateResultPage({ searchParams }: { searchParams: { order_id?: string } }) {
  const orderId = searchParams.order_id || '';
  const result = orderId ? await confirmCashfreeOrder(orderId) : { ok: false, error: 'This payment link is missing an order.' };
  const receipt = result.receipt;
  const paid = receipt?.status === 'paid';
  return (
    <main className="section shell max-w-xl">
      <h1 className="text-4xl">{paid ? 'Thank you' : 'Donation update'}</h1>
      <p className="mt-4 leading-7 text-stone-700">{receipt?.message || result.error || 'The payment could not be confirmed.'}</p>
      {receipt ? (
        <dl className="mt-6 space-y-2 text-sm text-stone-700">
          <div className="flex justify-between gap-4"><dt>Amount</dt><dd>₹{receipt.amount.toLocaleString('en-IN')}</dd></div>
          <div className="flex justify-between gap-4"><dt>Name</dt><dd>{receipt.name}</dd></div>
          {receipt.paymentId ? <div className="flex justify-between gap-4"><dt>Payment</dt><dd className="font-mono text-xs">{receipt.paymentId}</dd></div> : null}
          {receipt.method ? <div className="flex justify-between gap-4"><dt>Method</dt><dd>{receipt.method}</dd></div> : null}
        </dl>
      ) : null}
      <Link href="/donate" className="mt-8 inline-block text-sm font-semibold text-brand hover:text-brandDark">Back to donate</Link>
    </main>
  );
}
