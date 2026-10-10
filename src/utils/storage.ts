import { CleanupPost, UserAccount, isUserAdmin } from '../types';
import { INITIAL_POSTS } from '../data/constants';
import { 
  savePostToFirebase, 
  toggleLikeInFirebase, 
  saveUserToFirebase, 
  findUserByEmailInFirebase,
  deletePostFromFirebase,
  deleteUserFromFirebase,
  purgeLegacyAccountsFromFirebase
} from './firebaseService';

const POSTS_STORAGE_KEY = 'cleanup_posts_v4';
const USER_STORAGE_KEY = 'cleanup_current_user_v4';
const ACCOUNTS_STORAGE_KEY = 'cleanup_all_accounts_v4';

export const DEFAULT_ADMIN_ACCOUNT: UserAccount = {
  id: 'admin-quin-raderstorf',
  name: 'Quin Raderstorf',
  city: 'San Francisco, CA',
  email: 'quin@raderstorf.com',
  avatarUrl: '👑',
  createdAt: 1718000000000,
  isAdmin: true,
};

// Purge any Denver Quin account and legacy gmail account, ensure SF Quin (quin@raderstorf.com) is Admin
try {
  const legacyKeys = [
    'cleanup_posts_feed_v1',
    'cleanup_posts_feed_v2',
    'cleanup_posts_feed_v3',
    'cleanup_current_user_v1',
    'cleanup_current_user_v2',
    'cleanup_current_user_v3',
    'cleanup_all_accounts_v1',
    'cleanup_all_accounts_v2',
    'cleanup_all_accounts_v3',
  ];
  legacyKeys.forEach((key) => localStorage.removeItem(key));

  // Purge legacy Denver Quin and quin.raderstorf@gmail.com from Firebase in the background
  purgeLegacyAccountsFromFirebase().catch(() => {});
  saveUserToFirebase(DEFAULT_ADMIN_ACCOUNT).catch(() => {});

  // Clean local accounts
  const rawAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (rawAccounts) {
    const accountsList: UserAccount[] = JSON.parse(rawAccounts);
    const sanitized = accountsList.filter((a) => {
      const isDenverQuin = 
        (a.name?.toLowerCase().includes('quin raderstorf') || a.email?.toLowerCase().includes('quin')) &&
        (a.city?.toLowerCase().includes('denver'));
      const isOldGmail = a.email?.toLowerCase() === 'quin.raderstorf@gmail.com';
      return !isDenverQuin && !isOldGmail;
    });

    // Ensure Quin from San Francisco (quin@raderstorf.com) is present and marked Admin
    const sfQuinIndex = sanitized.findIndex((a) => 
      a.email?.toLowerCase() === 'quin@raderstorf.com' ||
      (a.name?.toLowerCase().includes('quin raderstorf') && a.city?.toLowerCase().includes('san francisco'))
    );
    if (sfQuinIndex >= 0) {
      sanitized[sfQuinIndex] = {
        ...sanitized[sfQuinIndex],
        email: 'quin@raderstorf.com',
        city: 'San Francisco, CA',
        isAdmin: true,
      };
    } else {
      sanitized.unshift(DEFAULT_ADMIN_ACCOUNT);
    }
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(sanitized));
  }

  // Clean current logged in user
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (rawUser) {
    const userObj: UserAccount = JSON.parse(rawUser);
    if (
      userObj.email?.toLowerCase() === 'quin.raderstorf@gmail.com' ||
      (userObj.name?.toLowerCase().includes('quin raderstorf') && userObj.city?.toLowerCase().includes('denver'))
    ) {
      // Migrate to new SF admin account
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_ACCOUNT));
    } else if (
      userObj.email?.toLowerCase() === 'quin@raderstorf.com' ||
      (userObj.name?.toLowerCase().includes('quin raderstorf') && userObj.city?.toLowerCase().includes('san francisco'))
    ) {
      userObj.email = 'quin@raderstorf.com';
      userObj.city = 'San Francisco, CA';
      userObj.isAdmin = true;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
    }
  }
} catch {
  // Ignore in SSR/test environments
}

export function getStoredCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const user: UserAccount = JSON.parse(raw);
    if (user.email?.toLowerCase() === 'quin.raderstorf@gmail.com') {
      return DEFAULT_ADMIN_ACCOUNT;
    }
    if (
      user.name?.toLowerCase().includes('quin raderstorf') ||
      user.email?.toLowerCase() === 'quin@raderstorf.com'
    ) {
      user.email = 'quin@raderstorf.com';
      user.city = 'San Francisco, CA';
      user.isAdmin = true;
    } else if (isUserAdmin(user)) {
      user.isAdmin = true;
    }
    return user;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      if (user.email?.toLowerCase() === 'quin.raderstorf@gmail.com') {
        user = { ...DEFAULT_ADMIN_ACCOUNT };
      } else if (
        user.name?.toLowerCase().includes('quin raderstorf') ||
        user.email?.toLowerCase() === 'quin@raderstorf.com'
      ) {
        user.email = 'quin@raderstorf.com';
        user.city = 'San Francisco, CA';
        user.isAdmin = true;
      } else if (isUserAdmin(user)) {
        user.isAdmin = true;
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to save current user', err);
  }
}

export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    let accounts: UserAccount[] = raw ? JSON.parse(raw) : [];
    
    // Filter out Quin from Denver and old gmail
    accounts = accounts.filter((a) => {
      const isDenverQuin =
        (a.name?.toLowerCase().includes('quin raderstorf') || a.email?.toLowerCase().includes('quin')) &&
        a.city?.toLowerCase().includes('denver');
      const isOldGmail = a.email?.toLowerCase() === 'quin.raderstorf@gmail.com';
      return !isDenverQuin && !isOldGmail;
    });

    // Ensure Quin's SF admin account (quin@raderstorf.com) is always present
    const hasAdmin = accounts.some(
      (a) => a.email.toLowerCase() === DEFAULT_ADMIN_ACCOUNT.email.toLowerCase()
    );
    if (!hasAdmin) {
      accounts = [DEFAULT_ADMIN_ACCOUNT, ...accounts];
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      } catch {}
    } else {
      accounts = accounts.map((a) => {
        if (
          a.email?.toLowerCase() === DEFAULT_ADMIN_ACCOUNT.email.toLowerCase() ||
          (a.name?.toLowerCase().includes('quin raderstorf') && a.city?.toLowerCase().includes('san francisco'))
        ) {
          return {
            ...a,
            email: 'quin@raderstorf.com',
            city: 'San Francisco, CA',
            isAdmin: true,
          };
        }
        return a;
      });
    }

    return accounts.map((acc) => ({
      ...acc,
      isAdmin: isUserAdmin(acc),
    }));
  } catch {
    return [DEFAULT_ADMIN_ACCOUNT];
  }
}

export function registerAccount(accountData: {
  name: string;
  city: string;
  email: string;
  avatarUrl: string;
}): UserAccount {
  const emailClean = accountData.email.trim().toLowerCase();
  const isAdmin = isUserAdmin({ email: emailClean } as UserAccount);

  const newAccount: UserAccount = {
    id: 'user-' + Date.now(),
    name: accountData.name.trim(),
    city: accountData.city.trim(),
    email: emailClean,
    avatarUrl: accountData.avatarUrl,
    createdAt: Date.now(),
    isAdmin,
  };

  const accounts = getStoredAccounts();
  const updatedAccounts = [newAccount, ...accounts.filter((a) => a.email !== newAccount.email)];
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
  } catch (e) {
    console.error(e);
  }

  saveCurrentUser(newAccount);
  
  // Persist to Firebase in the background
  saveUserToFirebase(newAccount).catch((err) => {
    console.warn('Firebase user save note:', err);
  });

  return newAccount;
}

export function loginAccount(email: string): UserAccount | null {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'quin@raderstorf.com' || cleanEmail === 'quin.raderstorf@gmail.com') {
    saveCurrentUser(DEFAULT_ADMIN_ACCOUNT);
    return DEFAULT_ADMIN_ACCOUNT;
  }
  const accounts = getStoredAccounts();
  const matched = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (matched) {
    if (isUserAdmin(matched)) {
      matched.isAdmin = true;
    }
    saveCurrentUser(matched);
    return matched;
  }
  return null;
}

export function logoutUser(): void {
  saveCurrentUser(null);
}

export function getStoredPosts(): CleanupPost[] {
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) {
      return INITIAL_POSTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_POSTS;
  }
}

export function savePosts(posts: CleanupPost[]): void {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.warn('Failed to save posts directly to localStorage, applying quota fallback', err);
    try {
      // Fallback: preserve latest posts intact, strip heavy base64 data URLs from older posts
      const trimmedPosts = posts.map((p, idx) => {
        if (idx > 2 && p.photoUrl && p.photoUrl.startsWith('data:')) {
          return { ...p, photoUrl: undefined };
        }
        return p;
      });
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(trimmedPosts));
    } catch (e2) {
      console.error('localStorage quota completely full', e2);
    }
  }
}

export function addPost(newPost: CleanupPost): CleanupPost[] {
  const current = getStoredPosts();
  const updated = [newPost, ...current.filter((p) => p.id !== newPost.id)];
  savePosts(updated);

  // Persist to Firebase in background
  savePostToFirebase(newPost).catch((err) => {
    console.warn('Firebase post save note:', err);
  });

  return updated;
}

export function togglePostLike(postId: string): CleanupPost[] {
  const current = getStoredPosts();
  let willBeLiked = true;
  const updated = current.map((p) => {
    if (p.id === postId) {
      const isLiked = !!p.liked;
      willBeLiked = !isLiked;
      return {
        ...p,
        liked: !isLiked,
        likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      };
    }
    return p;
  });
  savePosts(updated);

  // Sync like update to Firebase
  toggleLikeInFirebase(postId, willBeLiked).catch((err) => {
    console.warn('Firebase like update note:', err);
  });

  return updated;
}

/**
 * Permanently delete a post from local storage and trigger deletion in Firebase.
 */
export function deleteStoredPost(postId: string): CleanupPost[] {
  const current = getStoredPosts();
  const updated = current.filter((p) => p.id !== postId);
  savePosts(updated);

  deletePostFromFirebase(postId).catch((err) => {
    console.warn('Firebase delete post note:', err);
  });

  return updated;
}

/**
 * Permanently delete a user profile/account from local storage and trigger deletion in Firebase.
 */
export function deleteStoredAccount(userId: string, email?: string): UserAccount[] {
  const accounts = getStoredAccounts();
  const updated = accounts.filter(
    (a) => a.id !== userId && (!email || a.email.toLowerCase() !== email.toLowerCase())
  );
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  // Also remove from Firebase in background
  deleteUserFromFirebase(userId).catch((err) => {
    console.warn('Firebase delete user note:', err);
  });

  return updated;
}

