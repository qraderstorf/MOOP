import React from 'react';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-3xl',
  '2xl': 'w-24 h-24 text-4xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const isImageUrl =
    avatar &&
    (avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('data:image/') ||
      avatar.startsWith('blob:'));

  if (isImageUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-200 bg-zinc-100 ${sizeClasses} ${className}`}
      >
        <img
          src={avatar}
          alt={name ? `${name}'s avatar` : 'User avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If emoji or text avatar
  if (avatar && avatar.trim()) {
    return (
      <div
        className={`rounded-full shrink-0 flex items-center justify-center bg-emerald-50 border border-emerald-200/80 select-none shadow-2xs ${sizeClasses} ${className}`}
      >
        <span className="leading-none">{avatar}</span>
      </div>
    );
  }

  // Fallback to name initial
  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : '?';
  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center bg-zinc-200 text-zinc-700 font-bold border border-zinc-300 select-none ${sizeClasses} ${className}`}
    >
      <span className="leading-none">{initial}</span>
    </div>
  );
};
