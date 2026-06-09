import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'Japanese', 'Korean', 'Arabic'];

export default function Login() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin]   = useState(true);
  const [formData, setFormData] = useState({ preferred_language: 'English' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Architectural grid lines */}
      <div className="absolute inset-y-0 left-[10%] w-px bg-slate-200 pointer-events-none" />
      <div className="absolute inset-y-0 right-[10%] w-px bg-slate-200 pointer-events-none" />
      <div className="absolute inset-x-0 top-[15%] h-px bg-slate-200 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-[15%] h-px bg-slate-200 pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg bg-white border border-slate-200 p-10 flex flex-col gap-7 shadow-xl rounded-lg"
      >
        {/* Header */}
        <div className="border-b border-slate-200 pb-7">
          <h1 className="display-font text-blue-600 text-6xl font-extrabold tracking-tighter uppercase select-none">
            HAVAN
          </h1>
          <p className="text-slate-500 text-sm tracking-[0.35em] uppercase mt-3">
            {isLogin ? 'Access Portal' : 'Identity Registration'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-600 px-4 py-3 text-xs tracking-widest uppercase rounded-md">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col gap-5">
          <BrutalInput name="username"  type="text"     placeholder="Username"  onChange={handleChange} required />
          <BrutalInput name="password"  type="password" placeholder="Password"  onChange={handleChange} required />

          {!isLogin && (
            <div className="grid grid-cols-2 gap-5 animate-fade-in">
              <BrutalInput name="full_name" type="text"   placeholder="Full Name"  onChange={handleChange} required className="col-span-2" />
              <BrutalInput name="email"     type="email"  placeholder="Email"      onChange={handleChange} required className="col-span-2" />
              <BrutalInput name="age"       type="number" placeholder="Age"        onChange={handleChange} required min="1" max="120" />
              <BrutalInput name="mobile"    type="tel"    placeholder="Mobile No." onChange={handleChange} />
              <BrutalInput name="country"   type="text"   placeholder="Country"    onChange={handleChange} className="col-span-2" />
              <div className="col-span-2">
                <select
                  name="preferred_language"
                  className="w-full p-4 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none transition-colors text-sm tracking-widest rounded-md"
                  onChange={handleChange}
                  defaultValue="English"
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-blood w-full py-5 text-sm font-black uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-md"
        >
          {loading
            ? '...'
            : isLogin ? 'Initiate Access' : 'Commit Identity'
          }
        </button>

        {/* Toggle */}
        <p
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="text-slate-500 text-xs tracking-[0.25em] text-center uppercase cursor-pointer hover:text-blue-600 transition-colors select-none font-bold"
        >
          {isLogin ? 'Establish New Identity →' : '← Return to Access Portal'}
        </p>
      </form>
    </div>
  );
}

function BrutalInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full p-4 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none transition-colors placeholder-slate-400 text-sm tracking-wide rounded-md ${className}`}
    />
  );
}