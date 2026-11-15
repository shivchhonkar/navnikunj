import type { CollaborationKind, VolunteerRole } from './types';

export const PEOPLE_ROLES: {
  value: VolunteerRole;
  label: string;
  heading: string;
  anchor: string;
  summary: string;
  points: string[];
}[] = [
  {
    value: 'volunteer',
    label: 'Volunteer',
    heading: 'Volunteers',
    anchor: 'volunteer',
    summary: 'Give time on the ground. Volunteers help at learning sessions, health camps, relief drives, and community visits.',
    points: [
      'Join a program or a one-day drive',
      'Sit with children, families, or older residents',
      'Offer a skill the team can use that week',
    ],
  },
  {
    value: 'support',
    label: 'Support team',
    heading: 'Support team',
    anchor: 'support',
    summary: 'Help the work run. The support team handles coordination, outreach, records, and the tasks that keep a program moving.',
    points: [
      'Coordinate people and schedules',
      'Help with calls, records, and follow-up',
      'Support an event from behind the scenes',
    ],
  },
  {
    value: 'fundraiser',
    label: 'Fund raiser',
    heading: 'Fund raisers',
    anchor: 'fundraiser',
    summary: 'Raise support through your own network, a workplace, or a small campaign, and bring those gifts back to the foundation.',
    points: [
      'Host a collection among friends or colleagues',
      'Share a cause and invite people to give',
      'Help the team reach supporters it does not know yet',
    ],
  },
];

export const COLLABORATION_KINDS: { value: CollaborationKind; label: string }[] = [
  { value: 'school', label: 'School or college' },
  { value: 'company', label: 'Company or CSR' },
  { value: 'organisation', label: 'Another organisation' },
  { value: 'inkind', label: 'In-kind support' },
  { value: 'other', label: 'Something else' },
];

export function peopleRoleLabel(role: string) {
  return PEOPLE_ROLES.find((item) => item.value === role)?.label || 'Volunteer';
}

export function collaborationKindLabel(kind: string) {
  return COLLABORATION_KINDS.find((item) => item.value === kind)?.label || 'Something else';
}
