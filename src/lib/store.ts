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
