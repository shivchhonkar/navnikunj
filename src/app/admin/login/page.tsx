'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const field = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-stone-100';

export default function AdminLoginPage() {
  const router = useRouter();
  const busy = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        setError(data.error || 'Check the username and password.');
        passwordRef.current?.focus();
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Could not sign in. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)]">
      <section className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
        <img src="/images/LOGO_NT.svg" alt="" className="h-16 w-auto self-start rounded-xl bg-white object-contain p-2" />
        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">Navnikunj Foundation</p>
          <p className="mt-3 text-4xl leading-tight">Staff desk</p>
          <p className="mt-4 text-base leading-7 text-white/80">Sign in to update pages, news, photographs, and donations.</p>
        </div>
        <p className="text-sm text-white/60">For staff accounts only.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <img src="/images/LOGO_NT.svg" alt="Navnikunj Foundation" className="h-16 w-auto object-contain lg:hidden" />
          <h1 className="mt-6 text-3xl lg:mt-0">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Use the username and password for your desk account.</p>

          <form onSubmit={submit} className="mt-8" aria-busy={pending}>
            <fieldset disabled={pending} className="min-w-0 space-y-4 border-0 p-0">
              {error ? (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800">{error}</p>
              ) : null}
              <label className="block text-sm font-medium">Username
                <input name="username" required autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false} className={`mt-1.5 ${field}`} />
              </label>
              <label className="block text-sm font-medium">Password
                <span className="relative mt-1.5 block">
                  <input
                    ref={passwordRef}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    aria-invalid={error ? true : undefined}
                    className={`${field} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button disabled={pending} className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brandDark disabled:cursor-not-allowed disabled:opacity-60">
                {pending ? 'Signing in…' : 'Sign in'}
              </button>
            </fieldset>
          </form>

          <p className="mt-6 text-sm text-stone-500">
            <Link href="/" className="font-medium text-brand hover:text-brandDark">Back to the website</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
