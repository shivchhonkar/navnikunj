'use client';

import { HandHeart, Megaphone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { JoinForm } from '@/components/JoinForm';
import { PEOPLE_ROLES, peopleRoleLabel } from '@/lib/people';
import type { VolunteerRole } from '@/lib/types';

const ICONS: Record<VolunteerRole, LucideIcon> = {
  volunteer: Users,
  support: HandHeart,
  fundraiser: Megaphone,
};

type PublicPerson = {
  id: string;
  name: string;
  city: string;
  skills: string;
  role: VolunteerRole;
};

function roleFromHash(hash: string): VolunteerRole {
  const value = hash.replace(/^#/, '');
  if (value === 'support' || value === 'fundraiser' || value === 'volunteer') return value;
  return 'volunteer';
}

export function GetInvolvedPanel({ people }: { people: PublicPerson[] }) {
  const [role, setRole] = useState<VolunteerRole>('volunteer');
  const selected = PEOPLE_ROLES.find((item) => item.value === role) || PEOPLE_ROLES[0];
  const Icon = ICONS[selected.value];
  const shown = people.filter((person) => person.role === selected.value);

  useEffect(() => {
    const apply = () => setRole(roleFromHash(window.location.hash));
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  const choose = (next: VolunteerRole) => {
    setRole(next);
    const nextUrl = `${window.location.pathname}${window.location.search}#${next}`;
    window.history.replaceState(null, '', nextUrl);
  };

  return (
    <section className="section scroll-mt-32 bg-paper">
      {PEOPLE_ROLES.map((item) => <span key={item.anchor} id={item.anchor} className="block scroll-mt-32" />)}
      <div className="shell grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <Icon className="text-brand" size={22} aria-hidden />
          <h2 className="heading-lg mt-3 text-ink">{selected.heading}</h2>
          <p className="lead mt-4">{selected.summary}</p>
          <ul className="mt-5 space-y-2 text-sm leading-6 text-ink">
            {selected.points.map((point) => <li key={point} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{point}</li>)}
          </ul>
          {shown.length ? (
            <div className="mt-8">
              <h3 className="text-sm uppercase tracking-wide text-brand">With us</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {shown.map((person) => (
                  <li key={person.id} className="rounded-xl border border-line bg-white px-4 py-3">
                    <p className="font-semibold text-ink">{person.name}</p>
                    <p className="mt-1 text-sm text-muted">{[person.city, person.skills].filter(Boolean).join(' · ') || peopleRoleLabel(person.role)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="rounded-card bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-lg text-ink">Offer to join</h3>
          <p className="mt-1 text-sm text-muted">Tell us a little, and the team will follow up.</p>
          <div className="mt-5">
            <JoinForm role={role} onRoleChange={choose} />
          </div>
        </div>
      </div>
    </section>
  );
}
