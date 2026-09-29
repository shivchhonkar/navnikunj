'use client';

import { useState } from 'react';
import { Check, Link2, Mail } from 'lucide-react';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="currentColor" d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.92c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.41-.14-.95-.31-1.64-.61-2.88-1.25-4.76-4.16-4.9-4.35-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.4 1.02-.4.12 0 .23 0 .33.01.3.01.44.03.64.49.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.13-.28.27-.12.53.16.26.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.13.44.2.51.31.06.11.06.64-.18 1.32z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="currentColor" d="M14.5 8.5V6.8c0-.7.5-1 1.2-1h1.3V3h-2.2C12.2 3 11 4.4 11 6.6v1.9H9v2.8h2V21h3.5v-9.7h2.3l.3-2.8h-2.6z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="currentColor" d="M14.7 10.4 21.4 3h-1.6l-5.8 6.4L9.3 3H3.2l7 10L3.2 21h1.6l6.2-6.8L14.8 21h6.1l-7.2-10.6zM12 13.1l-.7-1-5.6-7.7h2.4l4.5 6.3.7 1 5.9 8.1h-2.4L12 13.1z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="currentColor" d="M6.5 9H4V20h2.5V9zM5.2 3.5A1.6 1.6 0 1 0 5.2 6.7 1.6 1.6 0 0 0 5.2 3.5zM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H11V9h2.4v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20z" />
    </svg>
  );
}

export function ShareLinks({ url, title, text }: { url: string; title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const message = `${title} — ${text}`;
  const links = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`, icon: <WhatsAppIcon /> },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: <FacebookIcon /> },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, icon: <XIcon /> },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, icon: <LinkedInIcon /> },
    { label: 'Email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n${url}`)}`, icon: <Mail size={16} /> },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-ink">Share this update</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((item) => (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-sm text-ink hover:border-brand hover:text-brand">
            {item.icon}
            {item.label}
          </a>
        ))}
        <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-sm text-ink hover:border-brand hover:text-brand">
          {copied ? <Check size={16} /> : <Link2 size={16} />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
