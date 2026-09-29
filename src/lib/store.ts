import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { createSeed } from './seed';
import type { SiteData } from './types';

const filePath = path.join(process.cwd(), 'data', 'site.json');
let cache: SiteData | null = null;

function ensureFile() {
  if (existsSync(filePath)) return;
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(createSeed(), null, 2));
}

export function getSite() {
  if (cache) return cache;
  ensureFile();
  cache = JSON.parse(readFileSync(filePath, 'utf8')) as SiteData;
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
