import { getSite } from '@/lib/store';

export default function DonationsPage() {
  const donations = getSite().donations;
  return (
    <main>
      <h1 className="text-3xl">Donations</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Donor</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Payment</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="px-3 py-3 whitespace-nowrap">{new Date(item.at).toLocaleString('en-IN')}</td>
                <td className="px-3 py-3">{item.name}<br /><span className="text-stone-500">{item.email} · {item.phone}</span></td>
                <td className="px-3 py-3">₹{item.amount.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 capitalize">{item.status}</td>
                <td className="px-3 py-3">{item.paymentId || item.orderId}</td>
              </tr>
            ))}
            {!donations.length && <tr><td className="px-3 py-6 text-stone-500" colSpan={5}>No donation attempts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
