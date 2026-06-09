import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = {
  A: '#2563EB', B: '#0066FF', C: '#00BB55', D: '#FF6600',
  E: '#9900CC', F: '#00AAAA', G: '#FF0099', H: '#CCAA00',
};

export default function Navbar({ profile, onSwitchProfile }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const navItems = [
    { path: '/',         label: 'Home' },
    { path: '/movies',   label: 'All Movies' },
    { path: '/watchlist',label: 'Watchlist' },
    { path: '/history',  label: 'History' },
    { path: '/profile',  label: 'Profile', mobileOnly: true },
  ];

  const activePath = location.pathname;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="display-font text-blue-600 text-3xl font-black tracking-tighter select-none hover:opacity-80 transition-opacity">
          HAVAN
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.filter(item => !item.mobileOnly).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-bold transition-all duration-200
                ${activePath === item.path
                  ? 'text-slate-900 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-blue-600'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Profile avatar */}
        {profile && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 group outline-none"
            >
              <div
                className="w-9 h-9 flex items-center justify-center border border-slate-300 rounded-full group-hover:border-blue-500 transition-colors bg-white shadow-sm"
                style={{ background: `${AVATAR_COLORS[profile.avatar]}15` }}
              >
                <span className="display-font text-lg font-black" style={{ color: AVATAR_COLORS[profile.avatar] }}>
                  {profile.name.charAt(0)}
                </span>
              </div>
              <span className="hidden md:block text-slate-500 text-xs tracking-[0.2em] uppercase group-hover:text-blue-600 transition-colors font-bold">
                {profile.name}
              </span>
              <span className="text-slate-400 text-xs">{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-slate-200 shadow-xl rounded-md z-50 overflow-hidden">
                <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                  <p className="text-slate-900 text-sm font-bold">{profile.name}</p>
                  <p className="text-slate-500 text-[10px] tracking-widest uppercase mt-1 font-bold">{profile.country || 'No country'}</p>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 tracking-widest uppercase transition-colors font-semibold"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => { onSwitchProfile(); setMenuOpen(false); navigate('/'); }}
                  className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 tracking-widest uppercase transition-colors font-semibold"
                >
                  Switch Profile
                </button>
                <div className="border-t border-slate-200">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 tracking-widest uppercase transition-colors font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileNav(!mobileNav)}
          className="md:hidden text-slate-500 hover:text-blue-600 text-xl leading-none outline-none"
        >
          {mobileNav ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileNav && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 flex flex-col md:hidden shadow-lg">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileNav(false)}
              className={`px-8 py-4 text-xs tracking-[0.25em] uppercase font-bold text-left transition-colors border-b border-slate-100
                ${activePath === item.path ? 'text-blue-600 bg-slate-50' : 'text-slate-500 hover:text-blue-600'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}