import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Smile, 
  Lightbulb, 
  Plus, 
  Calendar
} from 'lucide-react';
import { 
  getDailyQuote, 
  DailyCommunityQuote 
} from '../data/dailyCommunityQuotes';

interface DailyQuoteBannerProps {
  onNavigateToLogWalk: () => void;
}

export const DailyQuoteBanner: React.FC<DailyQuoteBannerProps> = ({
  onNavigateToLogWalk,
}) => {
  // Deterministic single item of the day: rotates across fact, pun, and slogan
  const todayQuote: DailyCommunityQuote = useMemo(() => getDailyQuote(), []);

  // Format today's date for display (e.g. "Sep 15")
  const todayDateString = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  // Theme styling based on today's single item type
  const typeConfig = {
    slogan: {
      label: 'Daily Slogan',
      icon: Sparkles,
      badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80',
      iconColor: 'text-emerald-700',
      containerBg: 'bg-emerald-50/70 border-emerald-200/80',
      titleColor: 'text-emerald-950',
      detailColor: 'text-emerald-900/85',
    },
    pun: {
      label: 'Daily Eco Pun',
      icon: Smile,
      badgeBg: 'bg-amber-100/90 text-amber-950 border-amber-300/80',
      iconColor: 'text-amber-700',
      containerBg: 'bg-amber-50/60 border-amber-200/80',
      titleColor: 'text-amber-950',
      detailColor: 'text-amber-950/85',
    },
    fact: {
      label: 'Daily MOOP Fact',
      icon: Lightbulb,
      badgeBg: 'bg-sky-100/90 text-sky-950 border-sky-300/80',
      iconColor: 'text-sky-700',
      containerBg: 'bg-sky-50/60 border-sky-200/80',
      titleColor: 'text-sky-950',
      detailColor: 'text-sky-950/85',
    },
  }[todayQuote.type];

  const IconComponent = typeConfig.icon;

  return (
    <div 
      className={`border rounded-2xl p-5 sm:p-6 mb-6 shadow-2xs transition-colors duration-300 ${typeConfig.containerBg}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
        <div className="space-y-3 flex-1 min-w-0">
          {/* Header Row: Badge & Date */}
          <div className="flex items-center gap-2 text-xs">
            {/* Dynamic Type Badge (Fact, Pun, or Slogan) */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold shadow-2xs ${typeConfig.badgeBg}`}>
              <IconComponent className={`w-3.5 h-3.5 ${typeConfig.iconColor}`} />
              <span>{typeConfig.label}</span>
            </div>

            {/* Date Indicator */}
            <div className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium px-2 py-0.5 bg-white/70 rounded-md border border-zinc-200/60">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>Today, {todayDateString}</span>
            </div>
          </div>

          {/* Main Title / Content */}
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight leading-snug ${typeConfig.titleColor}`}>
              “{todayQuote.title}”
            </h1>
            <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed max-w-xl ${typeConfig.detailColor}`}>
              {todayQuote.detail}
            </p>
          </div>

          {/* Author or Source citation if present */}
          {todayQuote.authorOrSource && (
            <div className="pt-1 flex items-center gap-2 text-zinc-500 text-[11px] border-t border-black/5">
              <span className="italic font-medium">Source: {todayQuote.authorOrSource}</span>
            </div>
          )}
        </div>

        {/* Action CTA: Share a Walk */}
        <div className="shrink-0 sm:self-center">
          <button
            type="button"
            id="btn-feed-cta-log-walk"
            onClick={onNavigateToLogWalk}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs hover:shadow cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Share a Walk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
