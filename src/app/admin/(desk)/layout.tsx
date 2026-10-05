import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { currentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminDeskLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  return <AdminShell user={user.displayName || user.username} role={user.role}>{children}</AdminShell>;
}
