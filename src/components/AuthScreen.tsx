import React, { useState, useRef, useEffect } from 'react';
import { 
  User, MapPin, Mail, Sparkles, Check, 
  LogIn, UserPlus, ArrowRight, Camera, Smile, 
  ArrowLeft, RefreshCw, X, Video, Upload, Crown
} from 'lucide-react';
import { UserAccount, isUserAdmin } from '../types';
import { POPULAR_CITIES, EMOJI_AVATARS } from '../data/constants';
import { registerAccount, loginAccount, getStoredAccounts, saveCurrentUser } from '../utils/storage';
import { findUserByEmailInFirebase } from '../utils/firebaseService';
import { UserAvatar } from './UserAvatar';
import { MoopLogo } from './MoopLogo';

interface AuthScreenProps {
  initialMode?: 'register' | 'login';
  onSuccess: (user: UserAccount) => void;
  onCancel?: () => void;
  allowCancel?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  initialMode = 'register', 
  onSuccess, 
  onCancel,
  allowCancel = true,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  
  // Registration form fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  
  // Avatar selection state
  const [avatarType, setAvatarType] = useState<'emoji' | 'photo'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_AVATARS[0]);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Common UI State
  const [error, setError] = useState('');
  const [existingAccounts, setExistingAccounts] = useState<UserAccount[]>([]);

  useEffect(() => {
    setExistingAccounts(getStoredAccounts());
  }, [mode]);

  // Clean up media stream when component unmounts or camera closes
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Live camera not supported in this browser. Please upload a photo instead.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access unavailable or cancelled:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload a file.');
      stopCameraStream();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
    stopCameraStream();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [suggestedEmailForRegister, setSuggestedEmailForRegister] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine current active avatar string
  const currentAvatar = avatarType === 'photo' && photoDataUrl 
    ? photoDataUrl 
    : (customEmojiInput.trim() || selectedEmoji);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuggestedEmailForRegister('');

    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city and state.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Check if account already exists with this email
    const existing = loginAccount(cleanEmail);
    if (existing) {
      onSuccess(existing);
      return;
    }

    const finalAvatar = currentAvatar || '🌿';

    const user = registerAccount({
      name: name.trim(),
      city: city.trim(),
      email: cleanEmail,
      avatarUrl: finalAvatar,
    });

    onSuccess(user);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuggestedEmailForRegister('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }

    setIsSubmitting(true);

    let user = loginAccount(cleanEmail);
    if (!user) {
      try {
        user = await findUserByEmailInFirebase(cleanEmail);
        if (user) {
          saveCurrentUser(user);
        }
      } catch (err) {
        console.warn('Firestore lookup note:', err);
      }
    }

    // Fallback: If this is Quin logging in with either quin@raderstorf.com or Quin@raderstorf.com
    if (!user && (cleanEmail === 'quin@raderstorf.com' || cleanEmail.includes('raderstorf'))) {
      user = registerAccount({
        name: 'Quin Raderstorf',
        city: 'San Francisco, CA',
        email: 'quin@raderstorf.com',
        avatarUrl: '👑',
      });
    }

    setIsSubmitting(false);

    if (!user) {
      setError(`No account found with email "${cleanEmail}".`);
      setSuggestedEmailForRegister(cleanEmail);
      return;
    }

    onSuccess(user);
  };

  const handleQuickLogin = (acc: UserAccount) => {
    const user = loginAccount(acc.email);
    if (user) {
      onSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-center py-8 px-4 sm:px-6">
      {/* Return to Feed Nav (only if user is already logged in or cancellation allowed) */}
      {allowCancel && onCancel && (
        <div className="max-w-xl w-full mx-auto mb-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 px-3.5 py-2 rounded-xl border border-zinc-200 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
            <span>Back to Feed</span>
          </button>
        </div>
      )}

      {/* Main Auth Screen Card */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-6 sm:p-8">
        {/* Brand Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 mb-6">
          <MoopLogo size="lg" showSubtitle={true} interactive={true} />
        </div>

        <div className="mb-6">
          <h1 className="font-bold text-zinc-900 text-xl sm:text-2xl tracking-tight">
            {mode === 'register' ? 'Join the MOOP Community' : 'Welcome Back to MOOP'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {mode === 'register'
              ? 'Clear Matter Out Of Place from streets, rate cleanliness, and keep neighborhood blocks clean.'
              : 'Sign in to log clean walks, share photos, and see what neighbors cleared.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            id="tab-create-account"
            onClick={() => {
              setMode('register');
              setError('');
              stopCameraStream();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'register' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            id="tab-sign-in"
            onClick={() => {
              setMode('login');
              setError('');
              stopCameraStream();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'login' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Sign In</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <div>{error}</div>
            {suggestedEmailForRegister && (
              <button
                type="button"
                onClick={() => {
                  setEmail(suggestedEmailForRegister);
                  setMode('register');
                  setError('');
                  setSuggestedEmailForRegister('');
                }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline block cursor-pointer"
              >
                Create new account with {suggestedEmailForRegister} →
              </button>
            )}
          </div>
        )}

        {mode === 'register' ? (
          /* ============================================================
             CREATE ACCOUNT FORM
             ============================================================ */
          <form onSubmit={handleRegister} className="space-y-6">
            {/* 1. Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                1. Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-reg-name"
                type="text"
                required
                placeholder="e.g. Jordan Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
            </div>

            {/* 2. City & State */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                2. City & State <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-reg-city"
                type="text"
                required
                placeholder="e.g. San Francisco, CA or Austin, TX"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-400 font-medium">Quick suggestions:</span>
                {POPULAR_CITIES.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-600 border border-zinc-200 transition cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                3. Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-reg-email"
                type="email"
                required
                placeholder="jordan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
            </div>

            {/* 4. Choose Avatar: Take Photo or Pick Emoji */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                <span>4. Your Profile Avatar <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-zinc-400 font-normal">Take a photo or choose an emoji</span>
              </label>

              {/* Sub-tabs for Avatar: Emoji vs Photo */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  id="tab-avatar-emoji"
                  onClick={() => {
                    setAvatarType('emoji');
                    stopCameraStream();
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    avatarType === 'emoji'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>Choose an Emoji</span>
                </button>
                <button
                  type="button"
                  id="tab-avatar-photo"
                  onClick={() => setAvatarType('photo')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    avatarType === 'photo'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Take / Upload Photo</span>
                </button>
              </div>

              {/* TAB CONTENT: EMOJI PICKER */}
              {avatarType === 'emoji' && (
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                  <span className="text-xs font-bold text-zinc-700 block">
                    Pick a Neighborhood Spirit Emoji:
                  </span>
                  
                  {/* Preset Emoji Grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {EMOJI_AVATARS.map((em) => {
                      const isSelected = selectedEmoji === em && !customEmojiInput.trim();
                      return (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setSelectedEmoji(em);
                            setCustomEmojiInput('');
                          }}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-100 ring-2 ring-emerald-600 scale-110 shadow-xs'
                              : 'bg-white hover:bg-zinc-100 border border-zinc-200'
                          }`}
                        >
                          {em}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Emoji Input */}
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium shrink-0">Or custom emoji:</span>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 🦊"
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      className="w-20 px-2.5 py-1 text-center text-lg bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    {customEmojiInput && (
                      <button
                        type="button"
                        onClick={() => setCustomEmojiInput('')}
                        className="text-xs text-zinc-400 hover:text-zinc-700"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TAKE PHOTO / UPLOAD */}
              {avatarType === 'photo' && (
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
                  {cameraError && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      {cameraError}
                    </div>
                  )}

                  {/* Live Camera View when Active */}
                  {isCameraActive ? (
                    <div className="space-y-3">
                      <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-emerald-500 shadow-md bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          id="btn-snap-photo"
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Snap Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCameraStream}
                          className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Cancel Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Photo preview or placeholder */}
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 bg-white flex items-center justify-center shrink-0">
                        {photoDataUrl ? (
                          <img
                            src={photoDataUrl}
                            alt="Captured avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>

                      {/* Photo Actions: Live Camera or File Upload */}
                      <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            id="btn-open-camera"
                            onClick={startCamera}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Take Photo with Camera</span>
                          </button>

                          <button
                            type="button"
                            id="btn-choose-file"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-300 transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Upload from Device</span>
                          </button>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        {photoDataUrl && (
                          <button
                            type="button"
                            onClick={() => setPhotoDataUrl(null)}
                            className="text-[11px] text-rose-600 hover:underline font-medium block"
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Preview Card */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Preview:</span>
                <UserAvatar avatar={currentAvatar} name={name || 'You'} size="md" />
                <div className="leading-tight">
                  <span className="text-xs font-bold text-zinc-900 block">
                    {name.trim() || 'Your Name'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {city.trim() || 'Your City'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-complete-register"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold rounded-2xl shadow-sm shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Create Account & Start Logging</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* ============================================================
             SIGN IN FORM
             ============================================================ */
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                Your Account Email
              </label>
              <input
                id="input-login-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
            </div>

            <button
              type="submit"
              id="btn-complete-login"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-sm font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            </button>

            {/* Accounts on this device */}
            {existingAccounts.length > 0 ? (
              <div className="pt-4 border-t border-zinc-100 space-y-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  Accounts on this device:
                </span>
                <div className="space-y-1.5">
                  {existingAccounts.map((acc) => {
                    const isAdminAcc = isUserAdmin(acc);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition cursor-pointer group ${
                          isAdminAcc
                            ? 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-300 ring-1 ring-amber-400/30'
                            : 'bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-300 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar avatar={acc.avatarUrl} name={acc.name} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-zinc-900 block leading-tight">
                                {acc.name}
                              </span>
                              {isAdminAcc && (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" />
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {acc.email} • {acc.city}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold transition group-hover:translate-x-0.5 ${
                          isAdminAcc ? 'text-amber-800' : 'text-emerald-700'
                        }`}>
                          Sign in →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-zinc-100 text-center">
                <p className="text-xs text-zinc-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Create an account here
                  </button>
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
