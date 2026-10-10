import React, { useState, useRef, useMemo } from 'react';
import { 
  Camera, MapPin, Building2, Send, Check, ArrowLeft, X, Calendar, Plus, Trash2,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CleanlinessLevel, CleanupPost, UserAccount } from '../types';
import { CLEANLINESS_LEVELS, COMMON_MOOP_TYPES } from '../data/constants';
import { searchSFStreets } from '../data/sfStreets';
import { searchCities, CityLocation } from '../data/usCities';
import { UserAvatar } from './UserAvatar';
import { MoopLogo } from './MoopLogo';

interface LogWalkPageProps {
  currentUser: UserAccount;
  onAddPost: (post: CleanupPost) => void;
  onCancel: () => void;
}

export const LogWalkPage: React.FC<LogWalkPageProps> = ({ currentUser, onAddPost, onCancel }) => {
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [city, setCity] = useState(currentUser.city || 'San Francisco, CA');
  const [showCityAutocomplete, setShowCityAutocomplete] = useState(false);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityBlurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [cleanupDate, setCleanupDate] = useState<string>(getTodayDateString());
  const [streets, setStreets] = useState<string[]>([]);
  const [streetInput, setStreetInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const autocompleteBlurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [mostCommonMoop, setMostCommonMoop] = useState('');
  const [cleanliness, setCleanliness] = useState<CleanlinessLevel>('spotless');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute matching City & State suggestions as user types
  const citySuggestions = useMemo(() => {
    const raw = city.trim();
    if (!raw) return [];
    return searchCities(raw, 7);
  }, [city]);

  const handleSelectCity = (chosenCity: CityLocation) => {
    setCity(chosenCity.formatted);
    setShowCityAutocomplete(false);
    setHighlightedCityIndex(-1);
    cityInputRef.current?.blur();
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showCityAutocomplete && citySuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedCityIndex((prev) => (prev < citySuggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedCityIndex((prev) => (prev > 0 ? prev - 1 : citySuggestions.length - 1));
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCityAutocomplete(false);
        setHighlightedCityIndex(-1);
        return;
      }
      if (e.key === 'Enter') {
        if (highlightedCityIndex >= 0 && citySuggestions[highlightedCityIndex]) {
          e.preventDefault();
          handleSelectCity(citySuggestions[highlightedCityIndex]);
          return;
        }
        setShowCityAutocomplete(false);
        return;
      }
    }

    if (e.key === 'Enter') {
      setShowCityAutocomplete(false);
    }
  };

  // Compute matching San Francisco streets based on user input
  const sfSuggestions = useMemo(() => {
    const raw = streetInput.trim();
    if (!raw) return [];
    return searchSFStreets(raw, 10).filter(
      (suggestion) => !streets.some((s) => s.toLowerCase() === suggestion.toLowerCase())
    );
  }, [streetInput, streets]);

  const addStreetByName = (streetName: string) => {
    const trimmed = streetName.trim();
    if (!trimmed) return;
    if (!streets.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setStreets((prev) => [...prev, trimmed]);
    }
    setStreetInput('');
    setShowAutocomplete(false);
    setHighlightedIndex(-1);
    streetInputRef.current?.focus();
  };

  const handleAddStreet = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const raw = streetInput.trim();
    if (!raw) return;

    // Support comma, semicolon, or newline separated multi-street input
    const newStreets = raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !streets.some((existing) => existing.toLowerCase() === s.toLowerCase()));

    if (newStreets.length > 0) {
      setStreets((prev) => [...prev, ...newStreets]);
    }
    setStreetInput('');
    setShowAutocomplete(false);
    setHighlightedIndex(-1);
    streetInputRef.current?.focus();
  };

  const handleStreetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAutocomplete && sfSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < sfSuggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : sfSuggestions.length - 1));
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
        setHighlightedIndex(-1);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && sfSuggestions[highlightedIndex]) {
          addStreetByName(sfSuggestions[highlightedIndex]);
          return;
        }
        handleAddStreet();
        return;
      }
    }

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddStreet();
    }
  };

  const handleRemoveStreet = (indexToRemove: number) => {
    setStreets((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const rawResult = readerEvent.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 720;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.65);
            resolve(compressed);
          } else {
            resolve(rawResult && rawResult.length < 400000 ? rawResult : '');
          }
        };
        img.onerror = () => resolve(rawResult && rawResult.length < 400000 ? rawResult : '');
        img.src = rawResult;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const compressedDataUrl = await compressImage(file);
      setPhotoUrl(compressedDataUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If user has un-submitted text in the street input box, include it automatically
    let finalStreets = [...streets];
    if (streetInput.trim()) {
      const pending = streetInput
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !finalStreets.some((existing) => existing.toLowerCase() === s.toLowerCase()));
      finalStreets = [...finalStreets, ...pending];
    }

    if (!city.trim() || finalStreets.length === 0) return;

    setIsSubmitting(true);

    // Fire celebration confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
    });

    const newPost: CleanupPost = {
      id: 'post-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      city: city.trim(),
      streetsCleaned: finalStreets.join(', '),
      streets: finalStreets,
      cleanupDate: cleanupDate || getTodayDateString(),
      mostCommonMoop: mostCommonMoop.trim() || undefined,
      cleanliness,
      photoUrl: photoUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: 'Just now',
      timestamp: Date.now(),
      likes: 1,
      liked: true,
    };

    onAddPost(newPost);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back button */}
      <button
        type="button"
        id="btn-back-to-feed"
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 px-3.5 py-2 rounded-xl border border-zinc-200/90 mb-5 transition cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
        <span>Back to Feed</span>
      </button>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-6 sm:p-8">
        {/* Header with user badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 mb-6">
          <div className="flex items-center gap-3">
            <MoopLogo badgeOnly size="lg" interactive={false} />
            <div>
              <h1 className="font-bold text-zinc-900 text-xl sm:text-2xl tracking-tight">
                Share a Clean Walk
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Record streets cleaned and current street condition
              </p>
            </div>
          </div>

          {/* Posting As badge */}
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
            <UserAvatar
              avatar={currentUser.avatarUrl}
              name={currentUser.name}
              size="xs"
            />
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 block font-medium">Posting as</span>
              <span className="text-xs font-bold text-zinc-900 block truncate max-w-[120px]">
                {currentUser.name}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. City Selection / Input (With Type-Ahead City & State Suggestions) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>City & State</span>
                <span className="text-rose-500">*</span>
              </label>
              {city && (
                <span className="text-[11px] font-medium text-zinc-500">
                  {city}
                </span>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  ref={cityInputRef}
                  id="input-city"
                  type="text"
                  required
                  placeholder="Type a city and state (e.g. San Francisco, CA or Austin, TX)..."
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setShowCityAutocomplete(true);
                    setHighlightedCityIndex(-1);
                  }}
                  onFocus={() => {
                    if (cityBlurTimeoutRef.current) {
                      clearTimeout(cityBlurTimeoutRef.current);
                    }
                    if (city.trim()) {
                      setShowCityAutocomplete(true);
                    }
                  }}
                  onBlur={() => {
                    cityBlurTimeoutRef.current = setTimeout(() => {
                      setShowCityAutocomplete(false);
                    }, 250);
                  }}
                  onKeyDown={handleCityKeyDown}
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/80 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition text-zinc-800 pr-9"
                />
                {city && (
                  <button
                    type="button"
                    onClick={() => {
                      setCity('');
                      setShowCityAutocomplete(false);
                      cityInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-3 p-0.5 text-zinc-400 hover:text-zinc-600 rounded cursor-pointer transition"
                    title="Clear city input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Floating City & State Autocomplete Dropdown */}
              {showCityAutocomplete && city.trim().length > 0 && citySuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in-50 duration-100 divide-y divide-zinc-100">
                  <div className="px-3.5 py-1.5 bg-emerald-50/70 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      Matching Cities
                    </span>
                    <span className="text-zinc-400 font-normal text-[10px]">Use ↑↓ to navigate · Enter to select</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5">
                    {citySuggestions.map((item, idx) => {
                      const isHighlighted = idx === highlightedCityIndex;
                      return (
                        <button
                          key={item.formatted}
                          type="button"
                          id={`city-autocomplete-item-${idx}`}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            handleSelectCity(item);
                          }}
                          onMouseEnter={() => setHighlightedCityIndex(idx)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            isHighlighted
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'hover:bg-emerald-50 text-zinc-800 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Building2 className={`w-3.5 h-3.5 shrink-0 ${isHighlighted ? 'text-white' : 'text-emerald-600'}`} />
                            <span className="truncate">{item.city}</span>
                            <span className={`text-[11px] ${isHighlighted ? 'text-emerald-100' : 'text-zinc-400'}`}>
                              ({item.stateFull})
                            </span>
                          </div>
                          <span className={`text-[10px] font-semibold shrink-0 ml-2 px-1.5 py-0.5 rounded ${
                            isHighlighted ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {item.formatted}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Date of Clean Up */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Date of Clean Up</span>
                <span className="text-rose-500">*</span>
              </label>
              {cleanupDate && (
                <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline-block">
                  {new Date(cleanupDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="input-cleanup-date"
                  type="date"
                  required
                  max={getTodayDateString()}
                  value={cleanupDate}
                  onChange={(e) => setCleanupDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/80 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition text-zinc-800"
                />
              </div>

              {/* Quick Date Selectors */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="btn-date-today"
                  onClick={() => setCleanupDate(getTodayDateString())}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border font-semibold transition cursor-pointer ${
                    cleanupDate === getTodayDateString()
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200/80'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  id="btn-date-yesterday"
                  onClick={() => setCleanupDate(getYesterdayDateString())}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border font-semibold transition cursor-pointer ${
                    cleanupDate === getYesterdayDateString()
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200/80'
                  }`}
                >
                  Yesterday
                </button>
              </div>
            </div>
          </div>

          {/* 3. Streets Cleaned (With Type-Ahead Street Suggestions) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Streets Cleaned</span>
                <span className="text-rose-500">*</span>
              </label>

              {streets.length > 0 && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {streets.length} {streets.length === 1 ? 'street' : 'streets'} added
                </span>
              )}
            </div>

            {/* Input to add individual or multiple streets with Type-Ahead Street Suggestions */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={streetInputRef}
                    id="input-street-item"
                    type="text"
                    placeholder="Type a street name (e.g. Valencia, 24th, Market)..."
                    value={streetInput}
                    onChange={(e) => {
                      setStreetInput(e.target.value);
                      setShowAutocomplete(true);
                      setHighlightedIndex(-1);
                    }}
                    onFocus={() => {
                      if (autocompleteBlurTimeoutRef.current) {
                        clearTimeout(autocompleteBlurTimeoutRef.current);
                      }
                      if (streetInput.trim()) {
                        setShowAutocomplete(true);
                      }
                    }}
                    onBlur={() => {
                      autocompleteBlurTimeoutRef.current = setTimeout(() => {
                        setShowAutocomplete(false);
                      }, 250);
                    }}
                    onKeyDown={handleStreetKeyDown}
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/80 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition"
                  />
                  {streetInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setStreetInput('');
                        setShowAutocomplete(false);
                        streetInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-3 p-0.5 text-zinc-400 hover:text-zinc-600 rounded cursor-pointer"
                      title="Clear street input"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  id="btn-add-street"
                  onClick={handleAddStreet}
                  disabled={!streetInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Floating Street Autocomplete Suggestions Dropdown */}
              {showAutocomplete && streetInput.trim().length > 0 && sfSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in-50 duration-100 divide-y divide-zinc-100">
                  <div className="px-3.5 py-1.5 bg-emerald-50/70 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      Street Suggestions
                    </span>
                    <span className="text-zinc-400 font-normal text-[10px]">Use ↑↓ to navigate · Enter to add</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5">
                    {sfSuggestions.map((suggestion, idx) => {
                      const isHighlighted = idx === highlightedIndex;
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          id={`sf-autocomplete-item-${idx}`}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            addStreetByName(suggestion);
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            isHighlighted
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'hover:bg-emerald-50 text-zinc-800 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isHighlighted ? 'text-white' : 'text-emerald-600'}`} />
                            <span className="truncate">{suggestion}</span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold shrink-0 ml-2 px-1.5 py-0.5 rounded ${
                            isHighlighted ? 'bg-white/20 text-white' : 'bg-emerald-100/70 text-emerald-800'
                          }`}>
                            + Add Street
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Added Streets Selected Badges */}
            {streets.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Selected Route ({streets.length})
                  </span>
                  {streets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setStreets([])}
                      className="text-[11px] text-zinc-400 hover:text-rose-600 font-semibold transition cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-2.5 bg-emerald-50/40 border border-emerald-200/60 rounded-xl">
                  {streets.map((st, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-950 text-xs font-semibold shadow-2xs group"
                    >
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStreet(idx)}
                        aria-label={`Remove ${st}`}
                        className="p-1 rounded-md text-emerald-700 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                        title={`Remove ${st}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Most Common MOOP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Most Common MOOP</span>
                <span className="text-zinc-400 font-normal lowercase tracking-normal">(optional)</span>
              </label>
              {mostCommonMoop && (
                <button
                  type="button"
                  id="btn-clear-moop"
                  onClick={() => setMostCommonMoop('')}
                  className="text-[11px] text-zinc-400 hover:text-rose-600 font-medium cursor-pointer transition"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="input-most-common-moop"
                type="text"
                placeholder="e.g. Cigarette butts, plastic bottle caps, snack wrappers..."
                value={mostCommonMoop}
                onChange={(e) => setMostCommonMoop(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/80 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Quick Pick Pills */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[11px] text-zinc-400 font-medium block">
                Quick pick commonly found litter:
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {COMMON_MOOP_TYPES.map((type) => {
                  const isSelected = mostCommonMoop.trim().toLowerCase() === type.toLowerCase();
                  return (
                    <button
                      key={type}
                      type="button"
                      id={`btn-moop-tag-${type.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      onClick={() => setMostCommonMoop(isSelected ? '' : type)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1.5 font-medium ${
                        isSelected
                          ? 'bg-amber-100/90 text-amber-950 border-amber-300 font-semibold shadow-2xs'
                          : 'bg-zinc-50/90 hover:bg-zinc-100 text-zinc-600 border-zinc-200/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-amber-700 stroke-[2.5]" />}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Cleanliness Rating */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Cleanliness Condition After Walk <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-0.5">
              {(Object.keys(CLEANLINESS_LEVELS) as CleanlinessLevel[]).map((levelKey) => {
                const meta = CLEANLINESS_LEVELS[levelKey];
                const isSelected = cleanliness === levelKey;
                return (
                  <button
                    key={levelKey}
                    type="button"
                    id={`btn-cleanliness-${levelKey}`}
                    onClick={() => setCleanliness(levelKey)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/20 shadow-2xs'
                        : 'bg-zinc-50/60 border-zinc-200 hover:bg-zinc-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: meta.dotColor }}
                      />
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-zinc-900">{meta.label}</span>
                    <span className="text-xs text-zinc-500 mt-0.5">{meta.subtext}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Picture of Cleanup / Streets */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
              <span>Walk Photo <span className="text-zinc-400 font-normal lowercase">(optional)</span></span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {photoUrl ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-zinc-900 block truncate">
                      {photoFileName || 'Photo attached'}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">Ready to share</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('');
                    setPhotoFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 bg-zinc-50/70 hover:bg-zinc-100/70 text-zinc-600 text-xs font-semibold rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Attach or take a photo of the cleared street</span>
              </button>
            )}
          </div>

          {/* 5. Notes / Caption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Notes <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="textarea-notes"
              rows={3}
              placeholder="Tell the community how the walk went, bags filled, or any spots to revisit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/80 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              id="btn-submit-post"
              disabled={isSubmitting || (streets.length === 0 && !streetInput.trim()) || !city.trim()}
              className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publish Clean Walk</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
