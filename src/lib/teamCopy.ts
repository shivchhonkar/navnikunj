import type { TeamPeopleCopy } from './types';

export function defaultTeamPeople(): TeamPeopleCopy {
  return {
    visible: true,
    eyebrow: 'With us',
    heading: 'Volunteers, support team, and fund raisers',
    subheading: 'The people who give time, keep the work moving, and raise support alongside the foundation.',
  };
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function withTeamPeople(value: unknown): TeamPeopleCopy {
  const base = defaultTeamPeople();
  const source = value && typeof value === 'object' ? value as Partial<TeamPeopleCopy> : {};
  return {
    visible: typeof source.visible === 'boolean' ? source.visible : base.visible,
    eyebrow: text(source.eyebrow, base.eyebrow),
    heading: text(source.heading, base.heading),
    subheading: text(source.subheading, base.subheading),
  };
}
