import type { CSSProperties } from 'react';
import type { SiteTheme } from './types';

export const DEFAULT_THEME: SiteTheme = {
  brand: '#e07a2f',
  brandDark: '#b04812',
  chrome: '#16100e',
  background: '#fff8f1',
  heroLight: '#fff8f1',
  heroDark: '#1c1412',
};

export const THEME_FIELDS: { key: keyof SiteTheme; label: string; hint: string }[] = [
  { key: 'brand', label: 'Theme colour', hint: 'Buttons, links, and the active menu mark.' },
  { key: 'brandDark', label: 'Theme colour, dark', hint: 'Button hover and outlined button text.' },
  { key: 'chrome', label: 'Header and footer', hint: 'Keep this dark. Header and footer text stays white.' },
  { key: 'background', label: 'Page background', hint: 'The cream behind the page content.' },
  { key: 'heroLight', label: 'Hero gradient, light', hint: 'The wash over the home banner and the donate banner.' },
  { key: 'heroDark', label: 'Hero gradient, dark', hint: 'The wash over the other page banners.' },
];

const HEX = /^#([0-9a-f]{6})$/i;

export function hexChannels(hex: string) {
  const match = HEX.exec(hex.trim());
  if (!match) return '';
  const value = match[1];
  return `${parseInt(value.slice(0, 2), 16)} ${parseInt(value.slice(2, 4), 16)} ${parseInt(value.slice(4, 6), 16)}`;
}

export function withTheme(value: unknown): SiteTheme {
  const incoming = value && typeof value === 'object' ? value as Partial<SiteTheme> : {};
  const theme = { ...DEFAULT_THEME };
  for (const key of Object.keys(DEFAULT_THEME) as (keyof SiteTheme)[]) {
    const color = typeof incoming[key] === 'string' ? incoming[key].trim() : '';
    if (hexChannels(color)) theme[key] = color.toLowerCase();
  }
  return theme;
}

export function readTheme(value: unknown): { theme: SiteTheme } | { error: string } {
  if (!value || typeof value !== 'object') return { error: 'Choose the theme colours.' };
  const source = value as Record<string, unknown>;
  const theme = { ...DEFAULT_THEME };
  for (const field of THEME_FIELDS) {
    // const color = typeof source[field.key] === 'string' ? source[field.key].trim() : '';
    const color = typeof source[field.key] === 'string' ? (source[field.key] as string).trim() : '';
    if (!hexChannels(color)) return { error: `${field.label} needs a colour like #e07a2f.` };
    theme[field.key] = color.toLowerCase();
  }
  return { theme };
}

export function themeVars(theme: SiteTheme): CSSProperties {
  const channels = (hex: string) => hexChannels(hex) || hexChannels(DEFAULT_THEME.brand);
  return {
    '--brand': channels(theme.brand),
    '--brand-dark': channels(theme.brandDark),
    '--chrome': channels(theme.chrome),
    '--footer': channels(theme.chrome),
    '--cream': channels(theme.background),
    '--hero-light': channels(theme.heroLight),
    '--hero-dark': channels(theme.heroDark),
  } as CSSProperties;
}
