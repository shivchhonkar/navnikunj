import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { isAdmin } from '@/lib/auth';
import { getSite } from '@/lib/store';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminDeskLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect('/admin/login');
  return <AdminShell user={getSite().adminUser}>{children}</AdminShell>;
}
