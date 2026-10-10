import { CleanlinessLevel, CleanlinessMeta, CleanupPost } from '../types';

export const CLEANLINESS_LEVELS: Record<CleanlinessLevel, CleanlinessMeta> = {
  spotless: {
    id: 'spotless',
    label: 'Spotless',
    subtext: 'Pristine, zero trash left in sight',
    emoji: '✨',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20',
    dotColor: '#059669',
  },
  mostly_clean: {
    id: 'mostly_clean',
    label: 'Mostly Clean',
    subtext: 'Main sidewalks and verges clear',
    emoji: '🌿',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 ring-teal-500/20',
    dotColor: '#0d9488',
  },
  partially_clean: {
    id: 'partially_clean',
    label: 'Partially Clean',
    subtext: 'Great progress, needs another round',
    emoji: '🌱',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    dotColor: '#d97706',
  },
};

export const INITIAL_POSTS: CleanupPost[] = [];

export const COMMON_MOOP_TYPES = [
  'Cigarette Butts',
  'Plastic Bottles & Caps',
  'Wrappers & Bags',
  'Coffee Cups & Lids',
  'Aluminum Cans',
  'Microplastics',
  'Broken Glass',
  'Takeout Containers',
];

export const SAMPLE_PHOTOS = [
  { label: 'Bag Haul', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Clean Sidewalk', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Curb Sweep', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Park Verge', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000&auto=format&fit=crop&q=80' },
];

export const POPULAR_CITIES = [
  'San Francisco, CA',
  'Portland, OR',
  'Austin, TX',
  'Seattle, WA',
  'Denver, CO',
  'Chicago, IL',
  'New York, NY',
];

export const EMOJI_AVATARS = [
  '🌿', '🌱', '🦊', '🌻', '🦝', '🌳', '🌼', '🏃', 
  '🐕', '☀️', '🌈', '🐝', '🦔', '🚲', '🌎', '🌊', 
  '👟', '🐿️', '🍁', '🍀', '🐱', '🐶', '🌸', '⚡',
];
