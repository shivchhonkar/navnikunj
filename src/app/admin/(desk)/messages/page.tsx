import { getSite } from '@/lib/store';

export default function MessagesPage() {
  const messages = getSite().messages;
  return (
    <main>
      <h1 className="text-3xl">Messages</h1>
      <ul className="mt-6 space-y-3">
        {messages.map((message) => (
          <li key={message.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-semibold">{message.name}</p>
            <p className="text-sm text-stone-500">{message.email} · {message.phone} · {new Date(message.at).toLocaleString('en-IN')}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.message}</p>
          </li>
        ))}
        {!messages.length && <li className="text-sm text-stone-500">No messages yet.</li>}
      </ul>
    </main>
  );
}
