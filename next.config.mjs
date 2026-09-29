/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      { source: '/admin', headers: noindex },
      { source: '/admin/:path*', headers: noindex },
      { source: '/api/:path*', headers: noindex },
    ];
  },
};

export default nextConfig;
