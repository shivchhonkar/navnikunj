export function MapEmbed({ query }: { query: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
  return (
    <iframe
      title={`Map showing ${query}`}
      src={src}
      className="min-h-[280px] w-full rounded-2xl border border-stone-200"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
