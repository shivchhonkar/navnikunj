import { isAdmin } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { mapLink, parseMapPoint } from '@/lib/map';

export async function POST(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const value = text(body.value);
  const direct = parseMapPoint(value);
  if (direct) return json(direct);

  const link = mapLink(value);
  if (!link) return fail('Paste a Google Maps link, or coordinates such as 27.580600, 77.700600.');

  try {
    const response = await fetch(link, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    const point = parseMapPoint(response.url);
    if (!point) return fail('That shared link did not include a map point. Paste the full Google Maps link, or enter the latitude and longitude.');
    return json(point);
  } catch {
    return fail('The shared link could not be opened. Enter the latitude and longitude instead.');
  }
}
