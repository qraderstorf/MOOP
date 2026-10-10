import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, User, MapPin, Mail, Calendar, Heart, Sparkles, 
  Trash2, Shield, Crown, Award, Building2, Flame, 
  Users, CheckCircle2, AlertTriangle, ChevronRight, LogOut,
  BarChart3, RefreshCw
} from 'lucide-react';
import { CleanupPost, UserAccount, isUserAdmin } from '../types';
import { CLEANLINESS_LEVELS } from '../data/constants';
import { UserAvatar } from './UserAvatar';
import { fetchAllUsersFromFirebase } from '../utils/firebaseService';
import { getStoredAccounts } from '../utils/storage';

interface ProfileStatsModalProps {
  user: UserAccount;
  allPosts: CleanupPost[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeletePost: (postId: string) => void;
  onDeleteAccount: (userId: string, email?: string, deleteUserPosts?: boolean) => Promise<void> | void;
  onNavigateToLogWalk: () => void;
}

export const ProfileStatsModal: React.FC<ProfileStatsModalProps> = ({
  user,
  allPosts,
  isOpen,
  onClose,
  onLogout,
  onDeletePost,
  onDeleteAccount,
  onNavigateToLogWalk,
}) => {
  const isAdmin = isUserAdmin(user);
  const [activeTab, setActiveTab] = useState<'stats' | 'walks' | 'admin'>('stats');

  // Admin directory state
  const [allUsersList, setAllUsersList] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  
  // Deletion confirm states
  const [postToDelete, setPostToDelete] = useState<CleanupPost | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [alsoDeleteUserPosts, setAlsoDeleteUserPosts] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all users when switching to admin tab
  useEffect(() => {
    if (isAdmin && activeTab === 'admin') {
      loadCommunityUsers();
    }
  }, [isAdmin, activeTab]);

  const loadCommunityUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const localAccounts = getStoredAccounts();
      const firestoreUsers = await fetchAllUsersFromFirebase();

      // Merge and deduplicate by email or id
      const combinedMap = new Map<string, UserAccount>();
      
      localAccounts.forEach((acc) => {
        const key = (acc.email || acc.id).toLowerCase();
        combinedMap.set(key, acc);
      });

      firestoreUsers.forEach((fu) => {
        const key = (fu.email || fu.id).toLowerCase();
        if (combinedMap.has(key)) {
          combinedMap.set(key, { ...combinedMap.get(key)!, ...fu });
        } else {
          combinedMap.set(key, fu);
        }
      });

      combinedMap.delete('quin.raderstorf@gmail.com');

      const list = Array.from(combinedMap.values())
        .filter((a) => {
          const isDenverQuin =
            (a.name?.toLowerCase().includes('quin raderstorf') || a.email?.toLowerCase().includes('quin')) &&
            a.city?.toLowerCase().includes('denver');
          const isOldGmail = a.email?.toLowerCase() === 'quin.raderstorf@gmail.com';
          return !isDenverQuin && !isOldGmail;
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllUsersList(list);
    } catch (err) {
      console.warn('Error fetching community users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Compute User Personal Stats
  const userPosts = useMemo(() => {
    return allPosts.filter(
      (p) =>
        (p.authorId && p.authorId === user.id) ||
        (p.authorName && p.authorName.toLowerCase() === user.name.toLowerCase())
    );
  }, [allPosts, user.id, user.name]);

  const stats = useMemo(() => {
    const totalWalks = userPosts.length;
    let totalLikes = 0;
    const allStreetsList: string[] = [];
    const moopCountMap: Record<string, number> = {};
    let spotlessCount = 0;
    let mostlyCleanCount = 0;
    let partiallyCleanCount = 0;

    userPosts.forEach((post) => {
      totalLikes += post.likes || 0;
      if (post.cleanliness === 'spotless') spotlessCount++;
      else if (post.cleanliness === 'mostly_clean') mostlyCleanCount++;
      else if (post.cleanliness === 'partially_clean') partiallyCleanCount++;

      const streets = post.streets && post.streets.length > 0
        ? post.streets
        : post.streetsCleaned
          ? post.streetsCleaned.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

      streets.forEach((s) => {
        if (s) allStreetsList.push(s);
      });

      if (post.mostCommonMoop) {
        moopCountMap[post.mostCommonMoop] = (moopCountMap[post.mostCommonMoop] || 0) + 1;
      }
    });

    // Street frequency
    const streetFreq: Record<string, number> = {};
    allStreetsList.forEach((st) => {
      streetFreq[st] = (streetFreq[st] || 0) + 1;
    });

    const topStreets = Object.entries(streetFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));

    const topMoops = Object.entries(moopCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));

    const spotlessPercent = totalWalks > 0 ? Math.round((spotlessCount / totalWalks) * 100) : 0;

    // Rank title
    let rankTitle = 'Neighborhood Scout';
    let rankIcon = '🌱';
    if (totalWalks >= 15) {
      rankTitle = 'Civic Champion';
      rankIcon = '👑';
    } else if (totalWalks >= 8) {
      rankTitle = 'Block Guardian';
      rankIcon = '✨';
    } else if (totalWalks >= 3) {
      rankTitle = 'Street Sweeper';
      rankIcon = '🌿';
    }

    return {
      totalWalks,
      totalLikes,
      uniqueStreetsCount: new Set(allStreetsList.map((s) => s.toLowerCase())).size,
      totalStreetCleanings: allStreetsList.length,
      spotlessCount,
      mostlyCleanCount,
      partiallyCleanCount,
      spotlessPercent,
      topStreets,
      topMoops,
      rankTitle,
      rankIcon,
    };
  }, [userPosts]);

  if (!isOpen) return null;

  // Format date
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  // Handle post deletion execution
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await onDeletePost(postToDelete.id);
      setPostToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle user deletion execution (admin power)
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteAccount(userToDelete.id, userToDelete.email, alsoDeleteUserPosts);
      setAllUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id && u.email !== userToDelete.email));
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user profile:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users for admin directory
  const filteredUsers = allUsersList.filter((u) => {
    if (!adminUserSearch.trim()) return true;
    const q = adminUserSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div 
        className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-900 text-white p-5 sm:p-6 pb-6">
          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <UserAvatar avatar={user.avatarUrl} name={user.name} size="xl" />
              {isAdmin && (
                <span 
                  className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 p-1 rounded-full shadow-md ring-2 ring-emerald-950" 
                  title="Verified Administrator"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="profile-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                  {user.name}
                </h2>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-white/15 text-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    {stats.rankIcon} {stats.rankTitle}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-emerald-100/80 mt-1.5 font-medium">
                {user.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    {user.city}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-200/60">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tab Selector */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10">
            <button
              id="tab-user-stats"
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Personal Stats</span>
            </button>

            <button
              id="tab-user-walks"
              type="button"
              onClick={() => setActiveTab('walks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'walks'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>My Walks ({stats.totalWalks})</span>
            </button>

            {isAdmin && (
              <button
                id="tab-admin-hub"
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-zinc-950 shadow-xs'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-white/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Controls</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: PERSONAL STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Top Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                    {stats.totalWalks}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mt-1">
                    Walks Logged
                  </div>
                </div>

                <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-teal-950">
                    {stats.uniqueStreetsCount}
                  </div>
                  <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider mt-1">
                    Streets Cleaned
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-amber-950">
                    {stats.spotlessPercent}%
                  </div>
                  <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mt-1">
                    Spotless Ratio
                  </div>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-rose-950">
                    {stats.totalLikes}
                  </div>
                  <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider mt-1">
                    High-Fives Earned
                  </div>
                </div>
              </div>

              {/* Cleanliness Breakdown */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Cleanliness Outcomes
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    {stats.totalWalks} recorded
                  </span>
                </div>

                {/* Progress ratio bar */}
                {stats.totalWalks > 0 ? (
                  <>
                    <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${(stats.spotlessCount / stats.totalWalks) * 100}%` }}
                        title={`Spotless: ${stats.spotlessCount}`}
                      />
                      <div 
                        className="bg-teal-500 h-full transition-all"
                        style={{ width: `${(stats.mostlyCleanCount / stats.totalWalks) * 100}%` }}
                        title={`Mostly Clean: ${stats.mostlyCleanCount}`}
                      />
                      <div 
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${(stats.partiallyCleanCount / stats.totalWalks) * 100}%` }}
                        title={`Partially Clean: ${stats.partiallyCleanCount}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-center text-xs">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-zinc-800">Spotless: {stats.spotlessCount}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        <span className="font-semibold text-zinc-800">Mostly Clean: {stats.mostlyCleanCount}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="font-semibold text-zinc-800">Partially Clean: {stats.partiallyCleanCount}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-3">
                    No walks logged yet. Go for your first MOOP walk to light up your stats!
                  </p>
                )}
              </div>

              {/* Two Column Section: Top Streets & Common MOOP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Top Streets */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Top Cleaned Streets
                  </h4>
                  {stats.topStreets.length > 0 ? (
                    <div className="space-y-2">
                      {stats.topStreets.map((st, idx) => (
                        <div 
                          key={st.name} 
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-zinc-800 truncate">{st.name}</span>
                          </div>
                          <span className="text-zinc-500 font-medium shrink-0 bg-white px-2 py-0.5 rounded-md border border-zinc-200 text-[11px]">
                            {st.count} {st.count === 1 ? 'walk' : 'walks'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic py-2">
                      Log a walk mentioning your favorite street.
                    </p>
                  )}
                </div>

                {/* Most Frequent MOOP Debris */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-teal-600" />
                    Most Common MOOP Cleared
                  </h4>
                  {stats.topMoops.length > 0 ? (
                    <div className="space-y-2">
                      {stats.topMoops.map((item) => (
                        <div 
                          key={item.name}
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs"
                        >
                          <span className="font-semibold text-zinc-800 truncate pr-2">{item.name}</span>
                          <span className="text-teal-800 font-bold shrink-0 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px]">
                            {item.count} {item.count === 1 ? 'time' : 'times'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic py-2">
                      Tag the main MOOP you discover on your walks.
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToLogWalk();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Log a New Clean Walk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY WALKS HISTORY */}
          {activeTab === 'walks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900">
                  Your Logged Clean Walks ({userPosts.length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToLogWalk();
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  + Add Walk
                </button>
              </div>

              {userPosts.length > 0 ? (
                <div className="space-y-3">
                  {userPosts.map((post) => {
                    const meta = CLEANLINESS_LEVELS[post.cleanliness] || CLEANLINESS_LEVELS.spotless;
                    return (
                      <div 
                        key={post.id}
                        className="p-4 bg-zinc-50/70 hover:bg-zinc-100/60 border border-zinc-200/80 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeClass}`}>
                              {meta.emoji} {meta.label}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">
                              {post.cleanupDate || post.createdAt}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-zinc-900 truncate">
                            {post.streetsCleaned}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span>{post.city}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <Heart className="w-3 h-3 fill-rose-500" />
                              {post.likes}
                            </span>
                            {post.mostCommonMoop && (
                              <>
                                <span>•</span>
                                <span className="truncate">MOOP: {post.mostCommonMoop}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Delete Walk Post Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPostToDelete(post)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-200"
                            title="Delete this walk post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 p-6 space-y-3">
                  <Sparkles className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-700">No clean walks logged yet</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Take a bag on your next neighborhood stroll, pick up litter, and log it to celebrate your impact.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToLogWalk();
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Log First Walk</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN CONTROLS HUB */}
          {isAdmin && activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Administrator Powers Enabled
                  </h4>
                  <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                    You are signed in as <strong>{user.email}</strong> with full moderation privileges.
                    You can remove any post from the community feed, manage member directories, and permanently delete registered profiles.
                  </p>
                </div>
              </div>

              {/* Community Profiles Management Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      Community Profiles ({allUsersList.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Manage registered accounts across Firestore and local storage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search member name, email, or city..."
                      value={adminUserSearch}
                      onChange={(e) => setAdminUserSearch(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 sm:w-60"
                    />
                    <button
                      type="button"
                      onClick={loadCommunityUsers}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                      title="Refresh list"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="p-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading community accounts...</span>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
                    {filteredUsers.map((profile) => {
                      const isSelf = profile.email.toLowerCase() === user.email.toLowerCase();
                      const isTargetAdmin = isUserAdmin(profile);
                      const userPostsCount = allPosts.filter(
                        (p) =>
                          p.authorId === profile.id ||
                          p.authorName.toLowerCase() === profile.name.toLowerCase()
                      ).length;

                      return (
                        <div 
                          key={profile.id || profile.email}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/70 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar avatar={profile.avatarUrl} name={profile.name} size="sm" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-900 truncate">
                                  {profile.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 rounded-sm">
                                    You
                                  </span>
                                )}
                                {isTargetAdmin && (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 rounded-sm flex items-center gap-0.5">
                                    <Crown className="w-2.5 h-2.5" />
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-500 truncate">
                                <span className="truncate">{profile.email}</span>
                                {profile.city && (
                                  <>
                                    <span>•</span>
                                    <span>{profile.city}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="font-semibold text-emerald-800">
                                  {userPostsCount} {userPostsCount === 1 ? 'walk' : 'walks'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isSelf ? (
                              <span className="text-[11px] text-zinc-400 italic px-2">Primary Admin</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setUserToDelete(profile);
                                  setAlsoDeleteUserPosts(true);
                                }}
                                className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                title={`Delete profile for ${profile.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Profile</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-zinc-400 italic">
                    No community profiles matched your search.
                  </div>
                )}
              </div>

              {/* Feed Moderation Notice */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Feed Post Moderation
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  As an admin, a red <strong>Delete Post (Admin)</strong> button appears on every cleanup walk card across the community feed.
                  Deleting a post removes it instantly from all devices and cleans it up from the Firestore database.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-medium">
            MOOP Neighborhood Community
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL: DELETE POST */}
      {postToDelete && (
        <div className="fixed inset-0 z-60 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900">Delete Cleanup Walk Post?</h4>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 text-xs space-y-1">
              <div className="font-bold text-zinc-800">{postToDelete.streetsCleaned}</div>
              <div className="text-zinc-500">Author: {postToDelete.authorName} • {postToDelete.city}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeletePost}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE USER PROFILE */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900">Delete User Profile?</h4>
                <p className="text-xs text-zinc-500">Admin Action</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete the profile for{' '}
              <strong>{userToDelete.name}</strong> ({userToDelete.email})?
              This will remove their profile from Firebase Firestore and directory lists.
            </p>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoDeleteUserPosts}
                onChange={(e) => setAlsoDeleteUserPosts(e.target.checked)}
                className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-medium text-zinc-700">
                Also delete all clean walk posts created by this user
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
