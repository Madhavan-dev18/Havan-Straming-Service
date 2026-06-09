import { useState } from 'react';
import { useAuth } from "../context/AuthContext";

export default function MovieCard({ movie, onPlay, onWatchlistToggle }) {
  const { user, authFetch, API } = useAuth();
  const [inList,   setInList]   = useState(movie.is_in_watchlist);
  const [hovered,  setHovered]  = useState(false);
  const [toggling, setToggling] = useState(false);

  const fmt = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    if (toggling || !user) return;
    setToggling(true);
    try {
      const res = await authFetch(`${API}/watchlist/`, {
        method: inList ? 'DELETE' : 'POST',
        body: JSON.stringify({ movie_id: movie.id }),
      });
      if (res && (res.ok || res.status === 201 || res.status === 204)) {
        setInList(!inList);
        onWatchlistToggle?.();
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="card-movie"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(movie)}
      style={{ width: 220, aspectRatio: '2/3' }}
    >
      {/* Poster */}
      {movie.thumbnail_url ? (
        <img
          src={movie.thumbnail_url}
          alt={movie.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          loading="lazy"
        />
      ) : (
        <div style={{
          width:'100%', height:'100%',
          background: 'linear-gradient(135deg, #e8f1ff 0%, #c7d9ff 100%)',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexDirection:'column', gap:8,
        }}>
          <div style={{ fontSize:48 }}>🎬</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:13, color:'#4a5568', textAlign:'center', padding:'0 12px' }}>{movie.title}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="overlay">
        {/* Top badges */}
        <div style={{ position:'absolute', top:10, left:10, right:10, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          {movie.rating && (
            <span style={{ background:'rgba(26,108,246,0.9)', color:'#fff', fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:6, fontFamily:'Outfit,sans-serif', backdropFilter:'blur(4px)' }}>
              {movie.rating}
            </span>
          )}
          <button
            onClick={toggleWatchlist}
            style={{
              background: inList ? '#1a6cf6' : 'rgba(255,255,255,0.15)',
              border: `1.5px solid ${inList ? '#1a6cf6' : 'rgba(255,255,255,0.4)'}`,
              borderRadius: 8, width: 32, height: 32,
              cursor: 'pointer', color: '#fff', fontSize: 16,
              backdropFilter: 'blur(4px)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s',
            }}
          >
            {inList ? '✓' : '+'}
          </button>
        </div>

        {/* Bottom info */}
        <div>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:4, lineHeight:1.3 }}>
            {movie.title}
          </h3>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10, flexWrap:'wrap' }}>
            {movie.release_year && <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{movie.release_year}</span>}
            {movie.duration_mins > 0 && <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{fmt(movie.duration_mins)}</span>}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onPlay(movie); }}
            style={{
              background:'#1a6cf6', border:'none', color:'#fff',
              padding:'8px 18px', borderRadius:8, cursor:'pointer',
              fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:13,
              display:'flex', alignItems:'center', gap:6, width:'100%', justifyContent:'center',
            }}
          >
            ▶ Play Now
          </button>
        </div>
      </div>
    </div>
  );
}