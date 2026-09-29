import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${inter.className}`}>{children}</div>;
}
