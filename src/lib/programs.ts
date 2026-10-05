import type { Program } from './types';

export const PROGRAM_PHOTOS: Record<string, string> = {
  'poverty-alleviation': '/images/banner_images/banner-poor-childrens.jpeg',
  'education-and-skill-development': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
  'community-health-and-nutrition': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
  'women-and-child-welfare': '/images/banner_images/banner-smile-face.jpeg',
  'environmental-sustainability': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
  'disaster-relief': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80',
};

export function programPhoto(program: Pick<Program, 'slug' | 'image'>) {
  return program.image || PROGRAM_PHOTOS[program.slug] || '';
}
