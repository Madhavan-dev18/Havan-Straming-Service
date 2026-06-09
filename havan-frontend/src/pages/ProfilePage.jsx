import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'Japanese', 'Korean', 'Arabic'];
const AVATAR_COLORS = {
  A: '#2563EB', B: '#0066FF', C: '#00BB55', D: '#FF6600',
  E: '#9900CC', F: '#00AAAA', G: '#FF0099', H: '#CCAA00',
};
const AVATARS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function ProfilePage({ profile, onProfileUpdated }) {
  const { authFetch, API } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [formData, setFormData] = useState({
    name:               profile.name,
    age:                profile.age,
    mobile:             profile.mobile,
    country:            profile.country,
    preferred_language: profile.preferred_language,
    avatar:             profile.avatar,
    pin:                '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      if (!payload.pin) delete payload.pin;
      const res = await authFetch(`${API}/profiles/${profile.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err)[0]);
      }
      setSuccess('Profile updated.');
      setTimeout(() => { setSuccess(''); setEditing(false); onProfileUpdated?.(); }, 1200);
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const color = AVATAR_COLORS[profile.avatar] || '#2563EB';

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto text-slate-900">
      {/* Profile header */}
      <div className="flex items-start gap-8 mb-12 pb-10 border-b border-slate-200">
        <div
          className="w-24 h-24 flex-shrink-0 flex items-center justify-center border border-slate-200 bg-white shadow-sm rounded-xl"
          style={{ background: `${color}10` }}
        >
          <span className="display-font text-5xl font-black" style={{ color }}>
            {profile.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="display-font text-5xl text-slate-900 font-black uppercase tracking-tight">
                {profile.name}
              </h1>
              {profile.is_main && (
                <span className="text-[10px] tracking-[0.4em] text-blue-600 uppercase font-bold bg-blue-50 px-2 py-1 rounded">Main Account</span>
              )}
            </div>
            <button
              onClick={() => { setEditing(!editing); setError(''); }}
              className={`btn-brutal text-xs px-6 py-3 tracking-[0.2em] flex-shrink-0 rounded-md transition-colors ${editing ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-600'}`}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!editing && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoBlock label="Language" value={profile.preferred_language} />
              <InfoBlock label="Country"  value={profile.country || '—'}     />
              <InfoBlock label="Age"      value={profile.age}                />
              <InfoBlock label="Mobile"   value={profile.mobile || '—'}      />
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="mb-16 border border-slate-200 bg-white p-10 rounded-xl shadow-sm">
          <h2 className="display-font text-2xl text-slate-800 uppercase tracking-tight mb-8">Edit Identity</h2>

          {error   && <div className="bg-red-50 border border-red-500 text-red-600 text-xs tracking-widest px-4 py-3 uppercase mb-6 rounded">{error}</div>}
          {success && <div className="bg-green-50 border border-green-500 text-green-600 text-xs tracking-widest px-4 py-3 uppercase mb-6 rounded">{success}</div>}

          {/* Avatar picker */}
          <div className="mb-8">
            <label className="text-slate-500 text-[10px] tracking-[0.3em] uppercase block mb-3 font-bold">Avatar</label>
            <div className="flex gap-3 flex-wrap">
              {AVATARS.map(av => (
                <div
                  key={av}
                  onClick={() => setFormData(p => ({ ...p, avatar: av }))}
                  className={`w-12 h-12 flex items-center justify-center cursor-pointer rounded-md transition-all border-2 ${formData.avatar === av ? 'border-blue-600 scale-110 shadow-sm' : 'border-transparent hover:border-slate-300'}`}
                  style={{ background: `${AVATAR_COLORS[av]}15` }}
                >
                  <span className="display-font text-xl font-black" style={{ color: AVATAR_COLORS[av] }}>{av}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <BrutalInput name="name"    type="text"   label="Name"          value={formData.name || ''}    onChange={handleChange} />
            <BrutalInput name="age"     type="number" label="Age"           value={formData.age  || ''}    onChange={handleChange} min="1" max="120" />
            <BrutalInput name="mobile"  type="tel"    label="Mobile"        value={formData.mobile  || ''} onChange={handleChange} />
            <BrutalInput name="country" type="text"   label="Country"       value={formData.country || ''} onChange={handleChange} />
            <div>
              <label className="text-slate-500 text-[10px] tracking-[0.3em] uppercase block mb-2 font-bold">Language</label>
              <select name="preferred_language" value={formData.preferred_language} onChange={handleChange}
                className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none text-sm tracking-wide rounded-md">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <BrutalInput
              name="pin" type="password" inputMode="numeric" maxLength={4}
              label="PIN (4 digits — blank to remove)"
              value={formData.pin || ''} onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-blood w-full mt-10 py-4 text-xs tracking-[0.2em] rounded-md disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Preferences summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="border border-slate-200 bg-white rounded-xl p-8 shadow-sm md:col-span-1">
          <h3 className="display-font text-2xl text-slate-800 uppercase tracking-tight mb-6">Preferences</h3>
          <div className="flex flex-col gap-5">
            <InfoBlock label="Language" value={profile.preferred_language} />
            <InfoBlock label="Country"  value={profile.country || '—'}     />
            <InfoBlock label="Lock"     value={profile.is_locked ? 'PIN Protected' : 'Open'} />
          </div>
        </div>
        <div className="border border-slate-200 bg-white rounded-xl p-8 shadow-sm md:col-span-2">
          <h3 className="display-font text-2xl text-slate-800 uppercase tracking-tight mb-6">Favourite Genres</h3>
          {profile.favorite_genres?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.favorite_genres.map(g => (
                <span key={g} className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 tracking-widest uppercase rounded-md font-bold border border-slate-200">{g}</span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs tracking-widest uppercase font-bold bg-slate-50 p-4 rounded border border-slate-200">No favourite genres set. Browse movies and watch to build recommendations.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.4em] text-slate-500 uppercase mb-1 font-bold">{label}</p>
      <p className="text-slate-900 text-sm font-black tracking-wide">{value}</p>
    </div>
  );
}

function BrutalInput({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-slate-500 text-[10px] tracking-[0.3em] uppercase block mb-2 font-bold">{label}</label>}
      <input
        {...props}
        className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none transition-colors placeholder-slate-400 text-sm tracking-wide rounded-md"
      />
    </div>
  );
}