import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CleanupPost, UserAccount } from '../types';

const POSTS_COLLECTION = 'posts';
const USERS_COLLECTION = 'users';

/**
 * Subscribe in real time to the community cleanup posts feed.
 * All users on all devices receive updates as soon as someone posts!
 */
export function subscribeToPosts(
  onUpdate: (posts: CleanupPost[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const postsQuery = query(
      collection(db, POSTS_COLLECTION),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const posts: CleanupPost[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          posts.push({
            id: docSnap.id,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Neighbor',
            authorAvatar: data.authorAvatar || '🌱',
            city: data.city || '',
            streetsCleaned: data.streetsCleaned || '',
            streets: Array.isArray(data.streets) ? data.streets : undefined,
            cleanupDate: data.cleanupDate || undefined,
            mostCommonMoop: data.mostCommonMoop || undefined,
            cleanliness: data.cleanliness || 'spotless',
            photoUrl: data.photoUrl || undefined,
            notes: data.notes || undefined,
            createdAt: data.createdAt || 'Recent',
            timestamp: data.timestamp || Date.now(),
            likes: typeof data.likes === 'number' ? data.likes : 0,
          });
        });
        onUpdate(posts);
      },
      (err) => {
        console.warn('Firestore real-time subscription error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize Firestore subscription:', err);
    return () => {};
  }
}

/**
 * Persist a new cleanup post to Firebase Firestore.
 */
export async function savePostToFirebase(post: CleanupPost): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, post.id);

  // Firestore throws error on undefined properties, so sanitize carefully
  const payload: Record<string, any> = {
    id: post.id,
    authorId: post.authorId || '',
    authorName: post.authorName || 'Neighbor',
    authorAvatar: post.authorAvatar || '🌱',
    city: post.city,
    streetsCleaned: post.streetsCleaned,
    cleanliness: post.cleanliness,
    createdAt: post.createdAt || 'Just now',
    timestamp: post.timestamp || Date.now(),
    likes: post.likes || 1,
  };

  if (post.streets && post.streets.length > 0) {
    payload.streets = post.streets;
  }
  if (post.cleanupDate) {
    payload.cleanupDate = post.cleanupDate;
  }
  if (post.mostCommonMoop) {
    payload.mostCommonMoop = post.mostCommonMoop;
  }
  if (post.photoUrl) {
    // Ensure data URL is within safe Firestore document size (1MB limit)
    if (post.photoUrl.startsWith('data:') && post.photoUrl.length > 800000) {
      // Very large base64 image; don't let it crash Firestore
      console.warn('Post photo base64 payload is unusually large, trimming to preserve post save');
    } else {
      payload.photoUrl = post.photoUrl;
    }
  }
  if (post.notes) {
    payload.notes = post.notes;
  }

  await setDoc(postRef, payload);
}

/**
 * Toggle a like on a post in Firestore.
 */
export async function toggleLikeInFirebase(postId: string, willBeLiked: boolean): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  try {
    await updateDoc(postRef, {
      likes: increment(willBeLiked ? 1 : -1),
    });
  } catch (err) {
    console.warn('Error updating like in Firestore:', err);
  }
}

/**
 * Save or update user profile in Firestore.
 */
export async function saveUserToFirebase(user: UserAccount): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, user.id);
  await setDoc(userRef, {
    id: user.id,
    name: user.name,
    city: user.city,
    email: user.email.toLowerCase(),
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt || Date.now(),
  });
}

/**
 * Look up a user account by email in Firestore.
 */
export async function findUserByEmailInFirebase(email: string): Promise<UserAccount | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', cleanEmail),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      const isAdmin = cleanEmail === 'quin@raderstorf.com' || !!docData.isAdmin;
      return {
        id: docData.id,
        name: docData.name,
        city: cleanEmail === 'quin@raderstorf.com' ? 'San Francisco, CA' : docData.city,
        email: cleanEmail,
        avatarUrl: cleanEmail === 'quin@raderstorf.com' ? '👑' : docData.avatarUrl,
        createdAt: docData.createdAt,
        isAdmin,
      };
    }
    return null;
  } catch (err) {
    console.warn('Error querying user in Firestore:', err);
    return null;
  }
}

/**
 * Delete a post document from Firestore.
 */
export async function deletePostFromFirebase(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
  } catch (err) {
    console.warn('Error deleting post in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a user document from Firestore.
 */
export async function deleteUserFromFirebase(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn('Error deleting user in Firestore:', err);
    throw err;
  }
}

/**
 * Fetch all registered users from Firestore for directory and admin management.
 */
export async function fetchAllUsersFromFirebase(): Promise<UserAccount[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const users: UserAccount[] = [];
    snap.forEach((docSnap) => {
      const docData = docSnap.data();
      const name = docData.name || 'Neighbor';
      const city = docData.city || '';
      const email = (docData.email || '').trim().toLowerCase();

      // Filter out deleted Quin profiles (Denver and old gmail)
      if (
        email === 'quin.raderstorf@gmail.com' ||
        (name.toLowerCase().includes('quin raderstorf') && city.toLowerCase().includes('denver'))
      ) {
        return;
      }

      const isQuinAdmin =
        email === 'quin@raderstorf.com' ||
        (name.toLowerCase().includes('quin raderstorf') && city.toLowerCase().includes('san francisco'));

      users.push({
        id: docSnap.id,
        name,
        city: isQuinAdmin ? 'San Francisco, CA' : city,
        email: isQuinAdmin ? 'quin@raderstorf.com' : email,
        avatarUrl: isQuinAdmin ? '👑' : (docData.avatarUrl || '🌱'),
        createdAt: docData.createdAt || Date.now(),
        isAdmin: isQuinAdmin ? true : docData.isAdmin,
      });
    });
    return users;
  } catch (err) {
    console.warn('Error fetching all users from Firestore:', err);
    return [];
  }
}

/**
 * Remove legacy accounts:
 * - Delete Quin Raderstorf from Denver
 * - Delete quin.raderstorf@gmail.com account
 * Ensure Quin Raderstorf (San Francisco, CA) with email quin@raderstorf.com is preserved as Admin.
 */
export async function purgeLegacyAccountsFromFirebase(): Promise<void> {
  try {
    const q = query(collection(db, USERS_COLLECTION));
    const snap = await getDocs(q);
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const name = (data.name || '').trim().toLowerCase();
      const city = (data.city || '').trim().toLowerCase();
      const email = (data.email || '').trim().toLowerCase();
      
      const shouldDelete =
        email === 'quin.raderstorf@gmail.com' ||
        ((name.includes('quin raderstorf') || email.includes('quin')) && city.includes('denver'));

      if (shouldDelete) {
        await deleteDoc(doc(db, USERS_COLLECTION, docSnap.id));
      }
    }
  } catch (err) {
    console.warn('Note on purging legacy accounts in Firestore:', err);
  }
}

