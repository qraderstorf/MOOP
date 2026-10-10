import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Check,
  MapPin,
  CheckCircle2,
  Sparkles,
  Building2,
  ArrowRight
} from 'lucide-react';
import {
  UNIQUE_SF_STREETS,
  POPULAR_SF_STREETS,
  SF_STREET_GROUPS,
} from '../data/sfStreets';

interface SFStreetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStreets: string[];
  onApplyStreets: (streets: string[]) => void;
}

const ALPHABET = [
  'All',
  '1-9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y'
];

export const SFStreetPickerModal: React.FC<SFStreetPickerModalProps> = ({
  isOpen,
  onClose,
  selectedStreets,
  onApplyStreets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('popular');
  const [activeLetter, setActiveLetter] = useState('All');
  const [stagedStreets, setStagedStreets] = useState<string[]>([]);

  // Sync staged streets whenever modal opens or selectedStreets changes
  useEffect(() => {
    if (isOpen) {
      setStagedStreets([...selectedStreets]);
      setSearchQuery('');
    }
  }, [isOpen, selectedStreets]);

  // Compute filtered streets
  const filteredStreets = useMemo(() => {
    let list = UNIQUE_SF_STREETS;

    // Filter by group if no search query
    if (!searchQuery.trim()) {
      const groupMeta = SF_STREET_GROUPS.find((g) => g.id === activeGroup);
      if (groupMeta && groupMeta.id !== 'all') {
        list = list.filter(groupMeta.filter);
      }

      // Filter by alphabet letter if specified
      if (activeLetter !== 'All') {
        if (activeLetter === '1-9') {
          list = list.filter((s) => /^\d/.test(s));
        } else {
          list = list.filter((s) => s.toUpperCase().startsWith(activeLetter));
        }
      }
    } else {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => s.toLowerCase().includes(q));
    }

    return list;
  }, [searchQuery, activeGroup, activeLetter]);

  const toggleStreet = (street: string) => {
    setStagedStreets((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === street.toLowerCase());
      if (exists) {
        return prev.filter((s) => s.toLowerCase() !== street.toLowerCase());
      } else {
        return [...prev, street];
      }
    });
  };

  const handleApply = () => {
    onApplyStreets(stagedStreets);
    onClose();
  };

  if (!isOpen) return null;

  const newStreetsCount = stagedStreets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-zinc-200/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-picker-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-start justify-between gap-4 bg-zinc-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <MapPin className="w-4 h-4" />
              </span>
              <h2 id="sf-picker-title" className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                San Francisco Streets Directory
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Select or search from over 450+ verified San Francisco streets and avenues.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close directory"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick Controls */}
        <div className="p-4 border-b border-zinc-100 space-y-3 bg-white shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              id="input-search-sf-streets"
              placeholder="Search San Francisco street (e.g. Valencia, 24th, Market, Irving, Clement)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Neighborhood & Category Filters */}
          {!searchQuery && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {SF_STREET_GROUPS.map((grp) => {
                  const isActive = activeGroup === grp.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      id={`group-btn-${grp.id}`}
                      onClick={() => {
                        setActiveGroup(grp.id);
                        setActiveLetter('All');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
                      }`}
                    >
                      {grp.id === 'popular' && <Sparkles className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                      {grp.name}
                    </button>
                  );
                })}
              </div>

              {/* Alphabet quick jumps (shown when browsing 'all') */}
              {activeGroup === 'all' && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {ALPHABET.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => setActiveLetter(char)}
                      className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer shrink-0 ${
                        activeLetter === char
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Street Selection Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 font-medium">
            <span>
              Found <strong className="text-zinc-800">{filteredStreets.length}</strong> streets
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {filteredStreets.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Add all visible
                    const toAdd = filteredStreets.filter(
                      (s) => !stagedStreets.some((st) => st.toLowerCase() === s.toLowerCase())
                    );
                    setStagedStreets((prev) => [...prev, ...toAdd]);
                  }}
                  className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Select all visible
                </button>
              </div>
            )}
          </div>

          {filteredStreets.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-zinc-700">No streets found</p>
              <p className="text-xs text-zinc-400 mt-1">
                Try a different search term or enter a custom street name in the input.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredStreets.map((street) => {
                const isSelected = stagedStreets.some(
                  (s) => s.toLowerCase() === street.toLowerCase()
                );
                const isPopular = POPULAR_SF_STREETS.includes(street);

                return (
                  <button
                    key={street}
                    type="button"
                    id={`btn-sf-street-${street.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => toggleStreet(street)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer group ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-zinc-300 group-hover:border-emerald-400 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{street}</span>
                    </div>

                    {isPopular && !isSelected && (
                      <span className="text-[10px] uppercase font-bold text-emerald-700/70 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                        Popular
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px]">
              {newStreetsCount}
            </span>
            <span>{newStreetsCount === 1 ? 'street selected' : 'streets selected'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200/60 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-apply-sf-streets"
              onClick={handleApply}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply Streets ({newStreetsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
