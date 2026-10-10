/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Trash2, 
  Building2, User, LogOut, UserPlus, RotateCcw, X, MapPin, Sparkles, Crown, Shield
} from 'lucide-react';
import { CleanupPost, UserAccount, isUserAdmin } from './types';
import { 
  getStoredPosts, 
  savePosts,
  addPost, 
  togglePostLike, 
  getStoredCurrentUser, 
  logoutUser,
  deleteStoredPost,
  deleteStoredAccount
} from './utils/storage';
import { subscribeToPosts, savePostToFirebase } from './utils/firebaseService';
import { LogWalkPage } from './components/LogWalkPage';
import { PostCard } from './components/PostCard';
import { AuthScreen } from './components/AuthScreen';
import { UserAvatar } from './components/UserAvatar';
import { MoopLogo } from './components/MoopLogo';
import { ProfileStatsModal } from './components/ProfileStatsModal';
import { DailyQuoteBanner } from './components/DailyQuoteBanner';

export default function App() {
  const [posts, setPosts] = useState<CleanupPost[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStoredCurrentUser());
  const [currentPage, setCurrentPage] = useState<'feed' | 'log-walk' | 'auth'>(() => {
    return getStoredCurrentUser() ? 'feed' : 'auth';
  });
  const [authInitialMode, setAuthInitialMode] = useState<'register' | 'login'>('register');
  const [pendingAction, setPendingAction] = useState<'log-walk' | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 1. Instantly load locally cached posts for zero delay
    const initialPosts = getStoredPosts();
    setPosts(initialPosts);
    const storedUser = getStoredCurrentUser();
    setCurrentUser(storedUser);
    if (!storedUser) {
      setCurrentPage('auth');
    }

    // 2. Real-time Firebase Firestore synchronization
    const unsubscribe = subscribeToPosts((remotePosts) => {
      setPosts((currentLocal) => {
        const remoteMap = new Map(remotePosts.map((p) => [p.id, p]));
        const localLikedMap = new Map(currentLocal.map((p) => [p.id, !!p.liked]));

        const updatedRemote: CleanupPost[] = remotePosts.map((rp) => ({
          ...rp,
          liked: localLikedMap.has(rp.id) ? !!localLikedMap.get(rp.id) : !!rp.liked,
        }));

        // Preserve any locally logged posts that haven't arrived in Firestore snapshot yet
        const pendingLocal = currentLocal.filter((lp) => !remoteMap.has(lp.id));

        // Re-sync any pending local posts to Firestore
        pendingLocal.forEach((lp) => {
          savePostToFirebase(lp).catch(() => {});
        });

        const merged = [...pendingLocal, ...updatedRemote].sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );

        savePosts(merged);
        return merged;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddPost = async (newPost: CleanupPost) => {
    const updated = addPost(newPost);
    setPosts(updated);
    setCurrentPage('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      await savePostToFirebase(newPost);
    } catch (err) {
      console.warn('Save post to Firebase note:', err);
    }
  };

  const handleToggleLike = (postId: string) => {
    const updated = togglePostLike(postId);
    setPosts(updated);
  };

  const handleDeletePost = (postId: string) => {
    const updated = deleteStoredPost(postId);
    setPosts(updated);
  };

  const handleDeleteAccount = (userId: string, email?: string, deleteUserPosts = true) => {
    deleteStoredAccount(userId, email);
    if (deleteUserPosts) {
      const targetEmail = email ? email.toLowerCase() : '';
      const postsToDelete = posts.filter(
        (p) => p.authorId === userId || (targetEmail && p.authorId === targetEmail)
      );
      postsToDelete.forEach((p) => {
        deleteStoredPost(p.id);
      });
      setPosts((prev) =>
        prev.filter(
          (p) => !(p.authorId === userId || (targetEmail && p.authorId === targetEmail))
        )
      );
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    setPendingAction(null);
    setAuthInitialMode('login');
    setCurrentPage('auth');
  };

  const handleNavigateToLogWalk = () => {
    if (!currentUser) {
      setPendingAction('log-walk');
      setAuthInitialMode('register');
      setCurrentPage('auth');
      return;
    }
    setCurrentPage('log-walk');
  };

  const handleOpenAuth = (mode: 'register' | 'login' = 'register') => {
    setPendingAction(null);
    setAuthInitialMode(mode);
    setCurrentPage('auth');
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.streetsCleaned.toLowerCase().includes(q) ||
      (post.streets && post.streets.some((st) => st.toLowerCase().includes(q))) ||
      (post.cleanupDate && post.cleanupDate.toLowerCase().includes(q)) ||
      (post.mostCommonMoop && post.mostCommonMoop.toLowerCase().includes(q)) ||
      post.city.toLowerCase().includes(q) ||
      (post.notes && post.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#f8faf9] text-zinc-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Application Bar */}
      {currentPage !== 'auth' && (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 transition-colors">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <button
              type="button"
              id="nav-brand-logo"
              onClick={() => setCurrentPage('feed')}
              className="text-left cursor-pointer shrink-0 focus:outline-hidden"
            >
              <MoopLogo size="md" showSubtitle={true} interactive={true} />
            </button>

            {/* Navigation Right Area: User Account */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    id="btn-open-profile-stats"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2.5 bg-zinc-50 hover:bg-emerald-50/70 border border-zinc-200/80 hover:border-emerald-300 px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer group shadow-2xs text-left"
                    title="View your clean walk stats and account details"
                  >
                    <div className="relative">
                      <UserAvatar avatar={currentUser.avatarUrl} name={currentUser.name} size="xs" />
                      {isUserAdmin(currentUser) && (
                        <span 
                          className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-0.5 rounded-full ring-1 ring-white" 
                          title="Administrator"
                        >
                          <Crown className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950 block leading-tight max-w-[120px] truncate">
                          {currentUser.name}
                        </span>
                        {isUserAdmin(currentUser) && (
                          <span className="text-[9px] font-extrabold text-amber-800 bg-amber-200/60 px-1 py-0.2 rounded leading-none border border-amber-300/60">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 group-hover:text-emerald-700 font-medium block leading-none max-w-[120px] truncate mt-0.5">
                        View Stats →
                      </span>
                    </div>
                  </button>

                  <button
                    id="btn-logout"
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                    title="Sign out of account"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-open-auth-page"
                  type="button"
                  onClick={() => handleOpenAuth('register')}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign In / Join</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {currentPage === 'auth' ? (
          <AuthScreen
            initialMode={authInitialMode}
            allowCancel={!!currentUser}
            onSuccess={(user) => {
              setCurrentUser(user);
              if (pendingAction === 'log-walk') {
                setCurrentPage('log-walk');
              } else {
                setCurrentPage('feed');
              }
              setPendingAction(null);
            }}
            onCancel={() => {
              if (currentUser) {
                setCurrentPage('feed');
              }
              setPendingAction(null);
            }}
          />
        ) : currentPage === 'log-walk' ? (
          currentUser ? (
            <LogWalkPage
              currentUser={currentUser}
              onAddPost={handleAddPost}
              onCancel={() => setCurrentPage('feed')}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
              <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">Account Required</h2>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Please sign in or create an account to share your clean walk with the neighborhood.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Sign In / Join MOOP
                  </button>
                  <button
                    onClick={() => setCurrentPage('feed')}
                    className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer font-medium"
                  >
                    Back to Feed
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Community Slogans, Puns & Facts Daily Banner */}
            <DailyQuoteBanner onNavigateToLogWalk={handleNavigateToLogWalk} />

            {posts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-zinc-200/90 p-8 shadow-2xs">
                <div className="mb-4 inline-block">
                  <MoopLogo size="xl" showSubtitle={false} />
                </div>
                <h3 className="font-bold text-zinc-900 text-xl">
                  No walks logged yet
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed mb-6">
                  Clear <b>Matter Out Of Place</b> on your block and share your cleaned route with neighbors!
                </p>
                <button
                  type="button"
                  id="btn-empty-state-log-walk"
                  onClick={handleNavigateToLogWalk}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Share the First Walk</span>
                </button>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="bg-white rounded-2xl border border-zinc-200/90 p-3 sm:p-3.5 mb-5 shadow-2xs">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5 sm:top-3 pointer-events-none" />
                    <input
                      id="input-search-street"
                      type="text"
                      placeholder="Search streets, neighborhoods, cities, or cleaned routes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm bg-zinc-50/80 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition placeholder:text-zinc-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2 sm:top-2.5 p-0.5 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Posts Stream */}
                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200/90 p-8 shadow-2xs">
                      <Trash2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <h3 className="font-bold text-zinc-800 text-sm">No walk posts found</h3>
                      <p className="text-xs text-zinc-500 mt-1 mb-4">
                        {searchQuery ? `No walks matched "${searchQuery}".` : 'No walks available yet.'}
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear Search</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onToggleLike={handleToggleLike}
                        onSelectCity={(city) => setSearchQuery(city)}
                        onDeletePost={handleDeletePost}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* User Profile & Walk Stats Modal (with Admin controls for deleting posts & profiles) */}
      {currentUser && (
        <ProfileStatsModal
          user={currentUser}
          allPosts={posts}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onDeletePost={handleDeletePost}
          onDeleteAccount={handleDeleteAccount}
          onNavigateToLogWalk={handleNavigateToLogWalk}
        />
      )}
    </div>
  );
}
