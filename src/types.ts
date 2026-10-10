export type CleanlinessLevel = 'spotless' | 'mostly_clean' | 'partially_clean';

export interface CleanlinessMeta {
  id: CleanlinessLevel;
  label: string;
  subtext: string;
  emoji: string;
  badgeClass: string;
  dotColor: string;
}

export interface UserAccount {
  id: string;
  name: string;
  city: string;
  email: string;
  avatarUrl: string;
  createdAt: number;
  isAdmin?: boolean;
}

export const ADMIN_EMAILS: string[] = ['quin@raderstorf.com'];

export function isUserAdmin(user?: UserAccount | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  return ADMIN_EMAILS.includes(email) || !!user.isAdmin;
}

export interface CleanupPost {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  city: string;
  streetsCleaned: string;
  streets?: string[];
  cleanupDate?: string;
  mostCommonMoop?: string;
  cleanliness: CleanlinessLevel;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  timestamp: number;
  likes: number;
  liked?: boolean;
}
