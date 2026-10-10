import React, { useId } from 'react';

interface MoopLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
  interactive?: boolean;
  className?: string;
  badgeOnly?: boolean;
  inverted?: boolean;
}

export const MoopLogo: React.FC<MoopLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitle,
  interactive = true,
  className = '',
  badgeOnly = false,
  inverted = false,
}) => {
  const maskId = useId().replace(/:/g, '-');
  const brandColor = inverted ? '#ffffff' : '#0d2b1d';
  const tagColor = inverted ? 'rgba(255, 255, 255, 0.9)' : '#0d2b1d';

  // Sizing definitions for Badge Mode
  const badgeDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  // Sizing definitions for Full Wordmark Mode
  const fullDimensions = {
    sm: showSubtitle ? 'h-9 w-auto' : 'h-7 w-auto',
    md: showSubtitle ? 'h-11 sm:h-12 w-auto' : 'h-8 sm:h-9 w-auto',
    lg: showSubtitle ? 'h-16 sm:h-20 w-auto' : 'h-12 sm:h-14 w-auto',
    xl: showSubtitle ? 'h-24 sm:h-28 w-auto' : 'h-16 sm:h-20 w-auto',
  }[size];

  // 1. Badge Only View (Circular Emblem with the Iconic O + Leaf)
  if (badgeOnly) {
    return (
      <div
        className={`${badgeDimensions} shrink-0 inline-flex items-center justify-center rounded-full overflow-hidden shadow-2xs ring-1 ring-emerald-950/15 transition-transform ${
          interactive ? 'hover:scale-105 cursor-pointer' : ''
        } ${className}`}
        title="MOOP - Leave No Trace. Anywhere."
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Dark Forest Green Background Circle */}
          <circle cx="60" cy="60" r="60" fill={brandColor} />

          {/* Mask for the Botanical Leaf Counter */}
          <defs>
            <mask id={`badge-mask-${maskId}`}>
              <rect x="-10" y="-10" width="140" height="140" fill="white" />
              {/* Botanical Leaf Cutout in counter */}
              <path
                d="M 53 76 C 46 69 44 55 50 45 C 54 38 60 34 66 33 C 67 37 71 49 69 59 C 66 70 60 76 53 76 Z"
                fill="black"
              />
            </mask>
          </defs>

          {/* Thick circular letter 'O' in crisp off-white */}
          <circle
            cx="60"
            cy="60"
            r="35"
            fill="#f7f5ee"
            mask={`url(#badge-mask-${maskId})`}
          />

          {/* Inner Leaf Vein Line */}
          <path
            d="M 53 76 C 57 67 61 54 66 33"
            stroke="#f7f5ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // 2. Full Logo View (Wordmark "MOOP" with Leaf in Counter + "LEAVE NO TRACE. ANYWHERE." Tagline)
  return (
    <div
      className={`inline-flex items-center select-none transition-opacity ${
        interactive ? 'hover:opacity-95 cursor-pointer' : ''
      } ${className}`}
      title="MOOP - Leave No Trace. Anywhere."
    >
      <svg
        viewBox={showSubtitle ? '0 -18 320 180' : '0 -18 320 138'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${fullDimensions} max-w-full overflow-visible drop-shadow-2xs`}
      >
        <defs>
          {/* Unique Mask for the twin O's with precise leaf counter and circular counter */}
          <mask id={`full-mask-${maskId}`}>
            {/* White base reveals everything with generous margin */}
            <rect x="-20" y="-30" width="360" height="220" fill="white" />

            {/* Leaf Counter inside the First O */}
            {/* Smooth botanical leaf contour with pointed apex at top right and stem base at bottom left */}
            <path
              d="M 139 91 C 131 82 129 65 137 53 C 142 45 149 40 157 39 C 158 44 163 58 160 71 C 156 84 148 91 139 91 Z"
              fill="black"
            />

            {/* Standard circular counter inside the Second O */}
            <circle cx="212" cy="67" r="22" fill="black" />
          </mask>
        </defs>

        <g fill={brandColor} stroke={brandColor}>
          {/* Letter M: Chunky, rounded geometric sans with baseline center vertex */}
          <path
            d="M 29 99 L 29 39 C 29 33 33 29 38.5 29 C 42.5 29 46 31.5 48 35 L 66 98 L 84 35 C 86 31.5 89.5 29 93.5 29 C 99 29 103 33 103 39 L 103 99"
            strokeWidth="21"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Twin Os: Merged silhouette passing through mask */}
          <g mask={`url(#full-mask-${maskId})`}>
            <circle cx="150" cy="67" r="42.5" stroke="none" fill={brandColor} />
            <circle cx="212" cy="67" r="42.5" stroke="none" fill={brandColor} />
          </g>

          {/* Leaf Central Vein inside First O */}
          <path
            d="M 139 91 C 144 80 149 65 157 39"
            stroke={brandColor}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Letter P: Vertical stem and rounded upper bowl */}
          <path
            d="M 262 99 L 262 38 C 262 32.5 266 28.5 271.5 28.5 L 291 28.5 C 304 28.5 313.5 38 313.5 51 C 313.5 64 304 73.5 291 73.5 L 262 73.5"
            strokeWidth="21"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Tagline: LEAVE NO TRACE. ANYWHERE. */}
        {showSubtitle && (
          <text
            x="160"
            y="144"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="12.5"
            fontWeight="800"
            letterSpacing="0.26em"
            fill={tagColor}
            textAnchor="middle"
          >
            {subtitle ? subtitle.toUpperCase() : 'LEAVE NO TRACE. ANYWHERE.'}
          </text>
        )}
      </svg>
    </div>
  );
};
