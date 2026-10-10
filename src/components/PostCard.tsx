import React, { useState } from 'react';
import { Heart, MapPin, Building2, Share2, Check, Calendar, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { CleanupPost, UserAccount, isUserAdmin } from '../types';
import { CLEANLINESS_LEVELS } from '../data/constants';
import { UserAvatar } from './UserAvatar';

interface PostCardProps {
  post: CleanupPost;
  currentUser?: UserAccount | null;
  onToggleLike: (postId: string) => void;
  onSelectCity?: (city: string) => void;
  onDeletePost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUser,
  onToggleLike, 
  onSelectCity,
  onDeletePost,
}) => {
  const meta = CLEANLINESS_LEVELS[post.cleanliness] || CLEANLINESS_LEVELS.spotless;
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = isUserAdmin(currentUser);
  const isAuthor = Boolean(
    currentUser &&
    ((post.authorId && post.authorId === currentUser.id) ||
      (post.authorName && post.authorName.toLowerCase() === currentUser.name.toLowerCase()))
  );
  const canDelete = Boolean(isAdmin || isAuthor);

  const streetsList: string[] = post.streets && post.streets.length > 0
    ? post.streets
    : post.streetsCleaned
      ? post.streetsCleaned.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const formatCleanupDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const cleanupDateFormatted = formatCleanupDate(post.cleanupDate);

  const handleShare = async () => {
    const streetsDisplay = streetsList.length > 0 ? streetsList.join(', ') : post.streetsCleaned;
    const shareText = `Check out this clean walk on ${streetsDisplay} in ${post.city} on MOOP!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MOOP - Clean Walk',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(
        `${shareText} ${window.location.href}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden mb-5"
    >
      {/* Post Top Bar: User & Status Badge */}
      <div className="p-4 sm:p-5 pb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              avatar={post.authorAvatar}
              name={post.authorName}
              size="md"
            />
            <div className="min-w-0">
              <span className="font-bold text-zinc-900 text-sm block leading-tight truncate">
                {post.authorName}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 font-medium mt-0.5">
                <span>{post.createdAt}</span>
                {cleanupDateFormatted && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-600 font-semibold inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      Cleaned {cleanupDateFormatted}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action: Cleanliness Status Indicator & Admin/Author Delete */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
              title={`Condition after walk: ${meta.label}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: meta.dotColor }}
              />
              <span>{meta.label}</span>
            </div>

            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isAdmin 
                    ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200' 
                    : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                }`}
                title={isAdmin ? "Delete post (Admin moderation)" : "Delete your post"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-rose-900 font-medium min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">
                {isAdmin ? "Admin: Delete this walk post permanently?" : "Delete your cleanup walk post?"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 text-zinc-600 hover:bg-white rounded-lg transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeletePost && onDeletePost(post.id);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-bold shadow-2xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Cleaned Street Segment & City & Date */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {post.city && (
            <button
              type="button"
              onClick={() => onSelectCity && onSelectCity(post.city)}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 bg-zinc-100/90 hover:bg-zinc-200/80 px-2.5 py-1 rounded-lg transition cursor-pointer"
              title={`Filter by ${post.city}`}
            >
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{post.city}</span>
            </button>
          )}

          {cleanupDateFormatted && (
            <div
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-900 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1 rounded-lg"
              title={`Cleanup date: ${cleanupDateFormatted}`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{cleanupDateFormatted}</span>
            </div>
          )}

          {streetsList.length > 0 ? (
            streetsList.map((street, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-950 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-1 rounded-lg"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{street}</span>
              </div>
            ))
          ) : post.streetsCleaned ? (
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-950 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{post.streetsCleaned}</span>
            </div>
          ) : null}

          {post.mostCommonMoop && (
            <div
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-950 bg-amber-50/90 border border-amber-200/90 px-2.5 py-1 rounded-lg shadow-2xs"
              title={`Most Common MOOP: ${post.mostCommonMoop}`}
            >
              <Trash2 className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Top MOOP:</span>
              <span className="font-semibold text-amber-900">{post.mostCommonMoop}</span>
            </div>
          )}
        </div>

        {/* Notes / Story text */}
        {post.notes && (
          <p className="mt-3 text-zinc-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {post.notes}
          </p>
        )}
      </div>

      {/* Cleanup Photo (Cleanly framed if present) */}
      {post.photoUrl && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 max-h-96 sm:max-h-[420px]">
            <img
              src={post.photoUrl}
              alt={`Cleaned ${post.streetsCleaned} in ${post.city}`}
              className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Post Action Footer */}
      <div className="px-4 sm:px-5 py-3 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            post.liked
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-zinc-200/80'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
              post.liked ? 'fill-rose-500 stroke-rose-500' : 'stroke-zinc-400'
            }`}
          />
          <span>{post.likes} {post.likes === 1 ? 'High-Five' : 'High-Fives'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
          title="Share walk"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="font-medium">Share</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
