import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ProfilePage from './pages/ProfilePage';
import ProfileSelector from './components/ProfileSelector';
import ProfileManager from './components/ProfileManager';
import Navbar from './components/Navbar';
import EditorialGrid from './components/EditorialGrid';
import FilterBar from './components/FilterBar';
import AdvancedPlayer from './components/AdvancedPlayer';

function buildMovieUrl(baseUrl, filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// ──────────────────────────────────────────────────────────────────
// INTERNAL APP CONTEXT (Wrapped inside Router)
// ──────────────────────────────────────────────────────────────────
function HavanApplication() {
  const { user, loading, authFetch, API } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMovie, setActiveMovie] = useState(null);
  const [profiles, setProfiles]           = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showManager, setShowManager]     = useState(false);

  // Content State
  const [movies, setMovies]               = useState([]);
  const [recommended, setRecommended]     = useState([]);
  const [watchlist, setWatchlist]         = useState([]);
  const [history, setHistory]             = useState([]);
  const [genres, setGenres]               = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [filters, setFilters]             = useState({
    category: '', genre: '', language: '', rating: '', search: '', sort: '-created_at',
  });

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authFetch(`${API}/profiles/`);
      if (res.ok) setProfiles(await res.json());
    } catch (e) { console.error('Profiles fetch failed', e); }
  }, [user, authFetch, API]);

  useEffect(() => {
    if (user && !activeProfile) fetchProfiles();
  }, [user, activeProfile, fetchProfiles]);

  // Fetch static lookups
  useEffect(() => {
    if (!activeProfile) return;
    authFetch(`${API}/genres/`).then(r => r.ok && r.json()).then(d => d && setGenres(d));
    authFetch(`${API}/movies/featured/`).then(r => r.ok && r.json()).then(d => d && setFeaturedMovie(d));
  }, [activeProfile, authFetch, API]);

  const fetchRecommended = useCallback(async () => {
    if (!activeProfile) return;
    const res = await authFetch(`${API}/movies/recommended/`, { headers: { 'Profile-Id': activeProfile.id } });
    if (res.ok) setRecommended(await res.json());
  }, [activeProfile, authFetch, API]);

  // Route-based fetching
  const fetchPageContent = useCallback(async () => {
    if (!activeProfile) return;
    const headers = { 'Profile-Id': activeProfile.id };
    const path = location.pathname;

    if (path === '/' || path === '/movies') {
      try {
        const url = buildMovieUrl(`${API}/movies/`, filters);
        const res = await authFetch(url, { headers });
        if (res.ok) setMovies(await res.json());
        if (path === '/') fetchRecommended();
      } catch (e) { console.error('Movies fetch failed', e); }
    } else if (path === '/watchlist') {
      try {
        const res = await authFetch(`${API}/watchlist/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setWatchlist(data.map(i => i.movie));
        }
      } catch (e) { console.error('Watchlist fetch failed', e); }
    } else if (path === '/history') {
      try {
        const res = await authFetch(`${API}/history/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.map(i => i.movie));
        }
      } catch (e) { console.error('History fetch failed', e); }
    }
  }, [location.pathname, activeProfile, filters, authFetch, API, fetchRecommended]);

  useEffect(() => { fetchPageContent(); }, [fetchPageContent]);

  // Global Actions
  const handleWatchlist = async (movie) => {
    if (!activeProfile) return;
    const headers   = { 'Profile-Id': activeProfile.id };
    const inList    = watchlist.some(m => m.id === movie.id);

    await authFetch(`${API}/watchlist/`, {
      method: inList ? 'DELETE' : 'POST',
      headers,
      body: JSON.stringify({ movie_id: movie.id }),
    });
    
    const res = await authFetch(`${API}/watchlist/`, { headers });
    if (res.ok) {
      const data = await res.json();
      setWatchlist(data.map(i => i.movie));
    }
  };

  const handleProgress = useCallback(async (progressSecs, completed) => {
    if (!activeMovie || !activeProfile) return;
    await authFetch(`${API}/history/`, {
      method: 'POST',
      headers: { 'Profile-Id': activeProfile.id },
      body: JSON.stringify({ movie_id: activeMovie.id, progress_secs: progressSecs, completed }),
    });
  }, [activeMovie, activeProfile, authFetch, API]);

  const handleNextEpisode = useCallback(async () => {
    if (!activeMovie?.next_episode) return;
    try {
      const res = await authFetch(`${API}/movies/${activeMovie.next_episode}/`);
      if (res.ok) setActiveMovie(await res.json());
    } catch (e) { console.error('Next episode fetch failed', e); }
  }, [activeMovie, authFetch, API]);

  const watchlistIds = new Set(watchlist.map(m => m.id));

  // ════════════════════════════════════════════
  // RENDER GATES
  // ════════════════════════════════════════════
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Login />;

  if (!activeProfile && !showManager) {
    return <ProfileSelector profiles={profiles} onSelectProfile={setActiveProfile} onManageProfiles={() => setShowManager(true)} />;
  }

  if (showManager) {
    return <ProfileManager profiles={profiles} onClose={() => setShowManager(false)} onRefresh={() => { fetchProfiles(); setShowManager(false); }} />;
  }

  const heroMovie = featuredMovie || (movies.length > 0 ? movies[0] : null);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar profile={activeProfile} onSwitchProfile={() => setActiveProfile(null)} />

      {activeMovie && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl">
          <AdvancedPlayer movie={activeMovie} onClose={() => setActiveMovie(null)} onNextEpisode={activeMovie.next_episode ? handleNextEpisode : null} onProgress={handleProgress} />
        </div>
      )}

      {/* Hero Section (Only on Home) */}
      {(location.pathname === '/') && heroMovie && (
        <div className="relative w-full h-[90vh] overflow-hidden bg-slate-100">
          {(heroMovie.backdrop_url || heroMovie.thumbnail_url) && (
            <img src={heroMovie.backdrop_url || heroMovie.thumbnail_url} alt={heroMovie.title} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 pt-20">
            <div className="max-w-2xl">
              <div className="flex gap-3 mb-5 items-center">
                {heroMovie.rating && <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm">{heroMovie.rating}</span>}
                {heroMovie.release_year && <span className="text-slate-500 text-xs tracking-widest font-bold">{heroMovie.release_year}</span>}
                {heroMovie.duration_mins > 0 && <span className="text-slate-500 text-xs font-bold">{heroMovie.duration_mins} min</span>}
                {heroMovie.is_trending && <span className="text-blue-600 text-[9px] uppercase tracking-widest font-black">▲ Trending</span>}
              </div>
              <h1 className="display-font text-5xl md:text-7xl font-extrabold text-slate-900 uppercase tracking-tighter leading-none mb-6">{heroMovie.title}</h1>
              {heroMovie.description && <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-lg font-medium line-clamp-3">{heroMovie.description}</p>}
              <div className="flex gap-4">
                <button onClick={() => setActiveMovie(heroMovie)} className="btn-blood rounded-md px-10 py-4 text-sm font-black uppercase tracking-[0.2em] shadow-lg hover:-translate-y-1 transition-all">▶ Play Now</button>
                <button onClick={() => handleWatchlist(heroMovie)} className={`btn-brutal rounded-md px-8 py-4 text-sm tracking-[0.2em] bg-white shadow-sm ${watchlistIds.has(heroMovie.id) ? 'border-blue-600 text-blue-600' : 'border-slate-300'}`}>
                  {watchlistIds.has(heroMovie.id) ? '✓ Listed' : '+ Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Routes */}
      <div className="relative z-10 max-w-[1800px] mx-auto mt-8">
        <Routes>
          <Route path="/" element={
            <>
              {recommended.length > 0 && <EditorialGrid title="Recommended for You" movies={recommended} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />}
              <EditorialGrid title="Trending Now" movies={movies.filter(m => m.is_trending)} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />
              <EditorialGrid title="Award Winners" movies={movies.filter(m => m.award_winning)} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />
              <EditorialGrid title="Family Friendly" movies={movies.filter(m => m.family_friendly)} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />
              <EditorialGrid title="All Movies" movies={movies} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />
            </>
          } />

          <Route path="/movies" element={
            <>
              <FilterBar genres={genres} filters={filters} onChange={setFilters} />
              <EditorialGrid title="Browse Movies" movies={movies} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />
            </>
          } />

          <Route path="/watchlist" element={
            watchlist.length > 0 ? (
              <EditorialGrid title="Your Watchlist" movies={watchlist} onPlay={setActiveMovie} onAddWatchlist={handleWatchlist} watchlistIds={watchlistIds} />
            ) : <EmptyState type="watchlist" onAction={() => navigate('/movies')} />
          } />

          <Route path="/history" element={
            history.length > 0 ? (
              <EditorialGrid title="Watch History" movies={history} onPlay={setActiveMovie} />
            ) : <EmptyState type="history" onAction={() => navigate('/movies')} />
          } />

          <Route path="/profile" element={
            <ProfilePage profile={activeProfile} onProfileUpdated={() => {
              fetchProfiles();
              authFetch(`${API}/profiles/${activeProfile.id}/`).then(r => r.ok && r.json()).then(d => d && setActiveProfile(d));
            }} />
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

// Reusable Empty State Component
function EmptyState({ type, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-8">
      <div className="w-16 h-1 bg-slate-300 mb-8 rounded" />
      <p className="display-font text-3xl text-slate-400 uppercase tracking-tight text-center">
        {type === 'watchlist' ? 'Nothing queued.' : 'No viewing history.'}
      </p>
      <p className="text-slate-500 text-xs tracking-[0.3em] uppercase mt-4 text-center font-bold">
        {type === 'watchlist' ? 'Add movies to your watchlist from the browse screen.' : 'Start watching a movie to build your history.'}
      </p>
      <button onClick={onAction} className="btn-brutal bg-white mt-10 px-8 py-4 text-xs tracking-[0.2em] rounded-md shadow-sm border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
        Browse Movies
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <HavanApplication />
    </Router>
  );
}