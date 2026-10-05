const COORDINATE = '(-?\\d+(?:\\.\\d+)?)';

const PATTERNS = [
  new RegExp(`@${COORDINATE},${COORDINATE}`),
  new RegExp(`!3d${COORDINATE}!4d${COORDINATE}`),
  new RegExp(`[?&](?:q|ll|query)=(?:loc:)?${COORDINATE},${COORDINATE}`),
  new RegExp(`geo:${COORDINATE},${COORDINATE}`),
  new RegExp(`^${COORDINATE}\\s*,\\s*${COORDINATE}$`),
];

export function parseMapPoint(value: string) {
  const text = value.trim();
  for (const pattern of PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue;
    return { latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) };
  }
  return null;
}

export function mapSearch(query: string, latitude: string, longitude: string) {
  const point = parseMapPoint(`${latitude.trim()},${longitude.trim()}`);
  if (latitude.trim() && longitude.trim() && point) return `${point.latitude},${point.longitude}`;
  return query.trim();
}

const MAP_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'www.google.com', 'google.com']);

export function mapLink(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !MAP_HOSTS.has(url.hostname)) return null;
    if ((url.hostname === 'www.google.com' || url.hostname === 'google.com' || url.hostname === 'maps.google.com') && !url.pathname.startsWith('/maps')) return null;
    return url;
  } catch {
    return null;
  }
}
