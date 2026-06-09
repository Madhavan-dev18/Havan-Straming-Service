import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileSelector({ profiles, onSelectProfile, onManageProfiles }) {
  const { authFetch, API } = useAuth();
  const [lockedProfile, setLockedProfile] = useState(null);
  const [pin, setPin]     = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (lockedProfile) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [lockedProfile]);

  const handleProfileClick = (profile) => {
    if (profile.is_locked) {
      setLockedProfile(profile);
      setPin(['', '', '', '']);
      setError(false);
    } else {
      onSelectProfile(profile);
    }
  };

  const handlePinInput = async (e, idx) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);

    if (val && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }

    if (newPin.join('').length === 4) {
      setLoading(true);
      try {
        const res = await authFetch(`${API}/verify-pin/`, {
          method: 'POST',
          body: JSON.stringify({ profile_id: lockedProfile.id, pin: newPin.join('') }),
        });
        if (res.ok) {
          onSelectProfile(lockedProfile);
        } else {
          triggerError();
        }
      } catch {
        triggerError();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const triggerError = () => {
    setError(true);
    setPin(['', '', '', '']);
    setTimeout(() => {
      setError(false);
      inputRefs.current[0]?.focus();
    }, 800);
  };

  const abort = () => {
    setLockedProfile(null);
    setPin(['', '', '', '']);
    setError(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-12 left-12 text-blue-600 display-font text-2xl font-black tracking-widest select-none">HAVAN</div>
      <div className="absolute top-12 right-12 text-slate-400 text-xs tracking-[0.4em] uppercase font-bold">Identity Gate</div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-400 text-[10px] tracking-[0.5em] uppercase font-bold">
        Select Profile to Continue
      </div>

      {!lockedProfile ? (
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="display-font text-5xl md:text-6xl text-slate-900 mb-4 tracking-tight uppercase">
            Who is watching?
          </h1>
          <div className="w-16 h-1 bg-blue-600 mb-20 rounded-full" />

          <div className="flex flex-wrap gap-10 md:gap-16 items-center justify-center max-w-4xl">
            {profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} onClick={handleProfileClick} />
            ))}
            {/* Add profile button */}
            {profiles.length < 5 && (
              <div
                onClick={onManageProfiles}
                className="group cursor-pointer flex flex-col items-center gap-6"
              >
                <div className="w-36 h-36 md:w-40 md:h-40 bg-white border-2 border-dashed border-slate-300 flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-lg rounded-xl">
                  <span className="text-slate-400 group-hover:text-blue-500 transition-colors text-5xl leading-none font-light">+</span>
                </div>
                <h3 className="tracking-[0.25em] text-xs text-slate-500 group-hover:text-blue-600 uppercase font-bold transition-colors">
                  Add Profile
                </h3>
              </div>
            )}
          </div>

          <button
            onClick={onManageProfiles}
            className="mt-20 btn-brutal bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs px-8 py-4 tracking-[0.25em] rounded-md shadow-sm"
          >
            Manage Profiles
          </button>
        </div>
      ) : (
        /* PIN entry screen */
        <div className={`flex flex-col items-center z-10 transition-all duration-300 ${error ? 'animate-pin-error' : ''}`}>
          <div className="w-24 h-24 bg-white border border-slate-200 flex items-center justify-center mb-8 rounded-2xl shadow-md">
            <span className="display-font text-5xl text-slate-900">
              {lockedProfile.name.charAt(0)}
            </span>
          </div>

          <h2 className="display-font text-3xl text-slate-900 mb-3 uppercase tracking-tight">
            Security Clearance
          </h2>
          <p className={`mb-12 tracking-widest uppercase text-xs font-bold transition-colors ${error ? 'text-red-500' : 'text-slate-500'}`}>
            {error ? '— Authorization Failed —' : `Enter PIN for ${lockedProfile.name}`}
          </p>

          <div className="flex gap-5 mb-14">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={loading}
                className={`w-14 h-18 md:w-16 md:h-20 bg-white border-b-4 text-center text-4xl display-font focus:outline-none transition-all duration-200 shadow-sm
                  ${error
                    ? 'border-red-500 text-red-600'
                    : 'border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                style={{ height: '5rem' }}
                onChange={(e) => handlePinInput(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              />
            ))}
          </div>

          <button
            onClick={abort}
            className="text-slate-500 hover:text-slate-900 tracking-[0.25em] text-xs uppercase font-bold transition-colors"
          >
            Abort Request
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile, onClick }) {
  const COLORS = {
    A: '#2563EB', B: '#0066FF', C: '#00BB55',
    D: '#FF6600', E: '#9900CC', F: '#00AAAA',
    G: '#FF0099', H: '#CCAA00',
  };
  const color = COLORS[profile.avatar] || '#2563EB';

  return (
    <div
      className="group cursor-pointer flex flex-col items-center gap-6 transition-transform duration-500 hover:-translate-y-2"
      onClick={() => onClick(profile)}
    >
      <div
        className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center relative transition-all duration-400 border border-slate-200 bg-white shadow-md group-hover:shadow-xl rounded-xl overflow-hidden group-hover:border-blue-400"
      >
        <div className="absolute inset-0 opacity-10" style={{ background: color }} />
        <span
          className="display-font text-6xl md:text-7xl font-extrabold transition-colors duration-300 relative z-10"
          style={{ color }}
        >
          {profile.name.charAt(0)}
        </span>

        {/* Lock indicator */}
        {profile.is_locked && (
          <div
            className="absolute top-4 right-4 w-3 h-3 rounded-full shadow-sm z-20"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      <h3 className="tracking-[0.25em] text-xs text-slate-600 group-hover:text-blue-600 uppercase font-bold transition-colors duration-300">
        {profile.name}
      </h3>
    </div>
  );
}