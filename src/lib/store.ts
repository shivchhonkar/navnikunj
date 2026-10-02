import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { createSeed } from './seed';
import type { SiteData } from './types';

const filePath = path.join(process.cwd(), 'data', 'site.json');
let cache: SiteData | null = null;
let cacheMtime = 0;

function ensureFile() {
  if (existsSync(filePath)) return;
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(createSeed(), null, 2));
}

/** site.json is not in git, so a server that already has the file keeps the previous contact details. */
function applyContactUpdate(site: SiteData) {
  const identity = site.identity;
  const oldEmail = identity.email.trim().toLowerCase() === 'info@navnikunjfoundation.org';
  const oldPhone = identity.phone.replace(/\D/g, '').endsWith('9650593996');
  if (!oldEmail && !oldPhone) return false;
  if (oldEmail) identity.email = 'info@navnikunjfoundation.com';
  if (oldPhone) {
    identity.phone = '+91 9720202640';
    identity.phoneHref = '+919720202640';
  }
  if (!identity.phone2) {
    identity.phone2 = '+91 9720202650';
    identity.phoneHref2 = '+919720202650';
  }
  return true;
}

export function getSite() {
  ensureFile();
  const mtime = statSync(filePath).mtimeMs;
  if (cache && cacheMtime === mtime) return cache;
  cacheMtime = mtime;
  cache = JSON.parse(readFileSync(filePath, 'utf8')) as SiteData;
  cache.identity.phone2 ||= '';
  cache.identity.phoneHref2 ||= '';
  cache.messages ||= [];
  cache.donations ||= [];
  for (const donation of cache.donations) {
    donation.pan ||= '';
    donation.address ||= '';
    donation.country ||= '';
  }
  cache.gallery ||= [];
  cache.posts ||= [];
  for (const post of cache.posts) post.keywords ||= '';
  cache.programs ||= [];
  if (applyContactUpdate(cache)) return saveSite(cache);
  return cache;
}

export function saveSite(site: SiteData) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(site, null, 2));
  cache = site;
  cacheMtime = statSync(filePath).mtimeMs;
  return site;
}

export function updateSite(change: (site: SiteData) => void) {
  const site = getSite();
  change(site);
  return saveSite(site);
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7200';
}

export function razorpayReady() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
