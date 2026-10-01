import { inter } from '@/fonts/inter';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${inter.className}`}>{children}</div>;
}
