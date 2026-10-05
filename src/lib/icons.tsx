import { BookOpen, HandHeart, HeartPulse, LifeBuoy, Sprout, Users, type LucideIcon } from 'lucide-react';
import type { ProgramIcon } from './types';

export const PROGRAM_ICONS: Record<ProgramIcon, LucideIcon> = {
  book: BookOpen,
  health: HeartPulse,
  users: Users,
  sprout: Sprout,
  heart: HandHeart,
  relief: LifeBuoy,
};

export const ICON_OPTIONS: ProgramIcon[] = ['book', 'health', 'users', 'sprout', 'heart', 'relief'];

export const ICON_LABELS: Record<ProgramIcon, string> = {
  book: 'Book',
  health: 'Health',
  users: 'People',
  sprout: 'Plant',
  heart: 'Care',
  relief: 'Relief',
};
