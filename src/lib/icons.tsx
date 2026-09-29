import { BookOpen, HandHeart, HeartPulse, Sprout, Users, type LucideIcon } from 'lucide-react';
import type { ProgramIcon } from './types';

export const PROGRAM_ICONS: Record<ProgramIcon, LucideIcon> = {
  book: BookOpen,
  health: HeartPulse,
  users: Users,
  sprout: Sprout,
  heart: HandHeart,
};

export const ICON_OPTIONS: ProgramIcon[] = ['book', 'health', 'users', 'sprout', 'heart'];
