import { mapSearch } from '@/lib/map';

export function MapEmbed({ query, latitude = '', longitude = '' }: { query: string; latitude?: string; longitude?: string }) {
  const place = mapSearch(query, latitude, longitude);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
  return (
    <iframe
      title={`Map showing ${place}`}
      src={src}
      className="min-h-[280px] w-full rounded-2xl border border-stone-200"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
