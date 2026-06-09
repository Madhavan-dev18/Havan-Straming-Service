import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'Japanese', 'Korean', 'Arabic'];
const AVATARS    = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const AVATAR_COLORS = {
  A: '#2563EB', B: '#0066FF', C: '#00BB55', D: '#FF6600',
  E: '#9900CC', F: '#00AAAA', G: '#FF0099', H: '#CCAA00',
};

export default function ProfileManager({ profiles, onClose, onRefresh }) {
  const { authFetch, API } = useAuth();
  const [editTarget, setEditTarget]   = useState(null); // profile object or 'new'
  const [formData, setFormData]       = useState({});
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const openNew = () => {
    setEditTarget('new');
    setFormData({ preferred_language: 'English', avatar: 'B' });
    setError('');
  };

  const openEdit = (profile) => {
    setEditTarget(profile);
    setFormData({
      name:               profile.name,
      age:                profile.age,
      mobile:             profile.mobile,
      country:            profile.country,
      preferred_language: profile.preferred_language,
      avatar:             profile.avatar,
      pin:                '',
    });
    setError('');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isNew = editTarget === 'new';
      const url    = isNew ? `${API}/profiles/` : `${API}/profiles/${editTarget.id}/`;
      const method = isNew ? 'POST' : 'PATCH';
      const payload = { ...formData };
      if (!payload.pin) delete payload.pin; 

      const res = await authFetch(url, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json();
        const msg = Object.values(err)[0];
        throw new Error(Array.isArray(msg) ? msg[0] : msg);
      }
      setSuccess(isNew ? 'Profile created.' : 'Profile updated.');
      setTimeout(() => { setSuccess(''); setEditTarget(null); onRefresh(); }, 1200);
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profile) => {
    if (!window.confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await authFetch(`${API}/profiles/${profile.id}/`, { method: 'DELETE' });
      onRefresh();
    } catch {
      setError('Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-10 left-10 text-slate-500 hover:text-blue-600 text-xs tracking-[0.3em] uppercase font-bold transition-colors"
      >
        ← Back
      </button>

      <h1 className="display-font text-5xl text-slate-900 mb-4 tracking-tight uppercase">Manage Profiles</h1>
      <div className="w-16 h-1 bg-blue-600 mb-16 rounded-full" />

      {!editTarget ? (
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {profiles.map(profile => (
              <div
                key={profile.id}
                className="flex items-center gap-5 bg-white border border-slate-200 p-5 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div
                  className="w-14 h-14 flex items-center justify-center flex-shrink-0 rounded-md"
                  style={{ background: `${AVATAR_COLORS[profile.avatar]}15` }}
                >
                  <span className="display-font text-2xl font-black" style={{ color: AVATAR_COLORS[profile.avatar] }}>
                    {profile.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold tracking-wide truncate">{profile.name}</p>
                  <p className="text-slate-500 text-[10px] tracking-widest uppercase mt-1 font-semibold">
                    {profile.is_main ? 'Main · ' : ''}{profile.country || 'No country'} · {profile.preferred_language}
                    {profile.is_locked && ' · 🔒'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => openEdit(profile)}
                    className="text-slate-400 hover:text-blue-600 text-[10px] tracking-widest uppercase font-bold transition-colors"
                  >
                    Edit
                  </button>
                  {!profile.is_main && (
                    <button
                      onClick={() => handleDelete(profile)}
                      className="text-slate-400 hover:text-red-600 text-[10px] tracking-widest uppercase font-bold transition-colors"
                    >
                      Del
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {profiles.length < 5 && (
            <button onClick={openNew} className="btn-blood w-full py-4 text-sm tracking-[0.2em] rounded-md shadow-sm">
              + Add New Profile
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="w-full max-w-md flex flex-col gap-6 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <h2 className="display-font text-3xl text-slate-900 uppercase tracking-tight">
            {editTarget === 'new' ? 'New Profile' : `Editing: ${editTarget.name}`}
          </h2>

          {error   && <div className="bg-red-50 border border-red-500 text-red-600 text-xs tracking-widest px-4 py-3 uppercase rounded">{error}</div>}
          {success && <div className="bg-green-50 border border-green-500 text-green-600 text-xs tracking-widest px-4 py-3 uppercase rounded">{success}</div>}

          <div>
            <label className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mb-3 block font-bold">Avatar</label>
            <div className="flex gap-3 flex-wrap">
              {AVATARS.map(av => (
                <div
                  key={av}
                  onClick={() => setFormData(p => ({ ...p, avatar: av }))}
                  className={`w-12 h-12 flex items-center justify-center cursor-pointer rounded-md transition-all border-2 ${formData.avatar === av ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent hover:border-slate-300'}`}
                  style={{ background: `${AVATAR_COLORS[av]}15` }}
                >
                  <span className="display-font text-xl font-black" style={{ color: AVATAR_COLORS[av] }}>{av}</span>
                </div>
              ))}
            </div>
          </div>

          <BrutalInput name="name"   type="text"   placeholder="Profile Name" value={formData.name   || ''} onChange={handleChange} required />
          <BrutalInput name="age"    type="number" placeholder="Age"          value={formData.age    || ''} onChange={handleChange} min="1" max="120" />
          <BrutalInput name="mobile" type="tel"    placeholder="Mobile"       value={formData.mobile || ''} onChange={handleChange} />
          <BrutalInput name="country" type="text"  placeholder="Country"      value={formData.country || ''} onChange={handleChange} />

          <select
            name="preferred_language"
            value={formData.preferred_language || 'English'}
            onChange={handleChange}
            className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none transition-colors text-sm tracking-widest rounded-md"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <div>
            <label className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mb-2 block font-bold">
              PIN Lock (4 digits — leave blank to remove lock)
            </label>
            <BrutalInput
              name="pin"
              type="password"
              inputMode="numeric"
              placeholder="● ● ● ●"
              maxLength={4}
              value={formData.pin || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn-blood flex-1 py-4 text-xs tracking-[0.2em] rounded-md disabled:opacity-50">
              {loading ? '...' : 'Save Profile'}
            </button>
            <button type="button" onClick={() => setEditTarget(null)} className="btn-brutal bg-white border-slate-300 text-slate-600 flex-1 py-4 text-xs tracking-[0.2em] rounded-md">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function BrutalInput(props) {
  return (
    <input
      {...props}
      className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none transition-colors placeholder-slate-400 text-sm tracking-wide rounded-md"
    />
  );
}