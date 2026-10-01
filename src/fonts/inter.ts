import localFont from 'next/font/local';

export const inter = localFont({
  src: './Inter-latin.woff2',
  display: 'swap',
  weight: '100 900',
  style: 'normal',
  variable: '--font-sans',
});
