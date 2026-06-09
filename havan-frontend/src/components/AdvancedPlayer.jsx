import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';

export default function AdvancedPlayer({ movie, onClose, onNextEpisode, onProgress }) {
  const videoRef      = useRef(null);
  const containerRef  = useRef(null);
  const hlsRef        = useRef(null);
  const hideTimer     = useRef(null);

  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(1);
  const [muted, setMuted]             = useState(false);
  const [fullscreen, setFullscreen]   = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeMenu, setActiveMenu]   = useState(null); 
  
  // Hard-Fail Diagnostic State
  const [sysError, setSysError]       = useState(null);

  // HLS Dynamic Qualities
  const [hlsLevels, setHlsLevels]     = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  // ════════════════════════════════════════════
  // CORE INITIALIZATION - HYBRID ENGINE
  // ════════════════════════════════════════════
  useEffect(() => {
    const video = videoRef.current;
    let src = movie?.hls_stream_url;
    
    if (!src || src.trim() === '') {
      setSysError(`DATABASE FAILURE: The field 'hls_stream_url' is completely empty for "${movie.title}". Go to your Django Admin panel and fix this record.`);
      return;
    }

    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (src.includes('.m3u8')) {
      src = `${src}?mid=${movie.id}&t=${Date.now()}`;

      if (Hls.isSupported()) {
        const hls = new Hls({ autoStartLoad: true });
        hlsRef.current = hls;
        
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
        hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => setHlsLevels(data.levels));
        hls.on(Hls.Events.LEVEL_SWITCHED, (e, data) => setCurrentLevel(data.level));
        hls.on(Hls.Events.ERROR, (e, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setSysError(`NETWORK ABORT: HLS.js could not download the manifest. The URL is either dead, or blocked by Supabase CORS policies.`);
                hls.destroy();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setSysError(`STREAM ABORT: Unrecoverable HLS parsing error.`);
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
      video.load();
      setHlsLevels([]); 
      setCurrentLevel(-1);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [movie]);

  // ════════════════════════════════════════════
  // ACTION HANDLERS
  // ════════════════════════════════════════════
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setFullscreen(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(e => console.error("Playback failed", e));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  // ════════════════════════════════════════════
  // KEYBOARD CONTROLS (GLOBAL LISTENER)
  // ════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key events if the user is typing in an input field somewhere
      if (document.activeElement.tagName.toLowerCase() === 'input') return;
      
      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault(); // Stop spacebar from scrolling the page down
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault(); // Stop up arrow from scrolling
          setVolume(v => {
            const newVol = Math.min(1, v + 0.1);
            video.volume = newVol;
            if (newVol > 0) { video.muted = false; setMuted(false); }
            return newVol;
          });
          break;
        case 'arrowdown':
          e.preventDefault(); // Stop down arrow from scrolling
          setVolume(v => {
            const newVol = Math.max(0, v - 0.1);
            video.volume = newVol;
            return newVol;
          });
          break;
        case 'm':
          setMuted(m => {
            video.muted = !m;
            return !m;
          });
          break;
        case 'f':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen]);

  // ════════════════════════════════════════════
  // UI & TIMING EFFECTS
  // ════════════════════════════════════════════
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [playing, resetHideTimer]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (duration > 0 && Math.round(t) % 10 === 0) {
      onProgress?.(Math.round(t), false);
    }
  };

  const switchQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
    setActiveMenu(null);
  };

  const seek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ════════════════════════════════════════════
  // RENDER (FATAL ERROR OVERLAY)
  // ════════════════════════════════════════════
  if (sysError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white p-10 text-center relative rounded-lg border-4 border-red-600 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-3xl text-slate-400 hover:text-white font-black transition-colors">✕</button>
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-5xl font-black mb-8 shadow-[0_0_30px_rgba(220,38,38,0.5)]">!</div>
        <h2 className="display-font text-5xl uppercase tracking-widest text-red-500 mb-6 font-extrabold">Playback Aborted</h2>
        <p className="text-slate-200 max-w-2xl font-mono text-base bg-black/60 p-6 rounded-md border border-red-900/50 leading-relaxed shadow-inner">
          {sysError}
        </p>
        <div className="mt-8 bg-slate-800 px-6 py-4 rounded w-full max-w-2xl border border-slate-700">
          <p className="text-slate-400 text-xs tracking-[0.2em] uppercase font-bold mb-2">Target URL Received From Database:</p>
          <p className="text-blue-400 font-mono text-sm break-all">{movie?.hls_stream_url || "NULL (No Data Provided)"}</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // RENDER (STANDARD UI)
  // ════════════════════════════════════════════
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-100 overflow-hidden shadow-2xl rounded-lg group"
      onMouseMove={resetHideTimer}
      // Note: Removed global onClick here to handle clicks strictly on the video/button
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black cursor-pointer"
        onClick={togglePlay} // Clicking anywhere on the video toggles playback
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => onProgress?.(Math.round(duration), true)}
        volume={volume}
        muted={muted}
      />

      {/* Light Theme Video Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-500 ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-auto">
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-2xl text-white/70 hover:text-white bg-black/30 backdrop-blur-md rounded-full shadow-lg transition-all hover:scale-110">✕</button>
          <div className="text-right text-white bg-black/40 backdrop-blur-md px-5 py-2 rounded-md shadow-sm border border-white/10">
            <p className="text-xs tracking-[0.35em] uppercase font-bold">{movie.title}</p>
          </div>
        </div>

        {/* Big Center Play Button (Now Clickable) */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer" onClick={togglePlay}>
            <div className="w-24 h-24 flex items-center justify-center bg-blue-600/90 backdrop-blur-sm rounded-full shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-transform hover:scale-110">
              <span className="text-4xl text-white pl-2">▶</span>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-20 px-8 pb-8 pointer-events-auto">
          <div className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-6 overflow-hidden shadow-inner" onClick={seek}>
            <div
              className="h-full bg-blue-500 relative transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 text-2xl w-8 text-center transition-colors font-black drop-shadow-md">
              {playing ? '⏸' : '▶'}
            </button>
            <span className="text-white font-mono font-bold bg-white/10 px-3 py-1.5 rounded text-sm backdrop-blur-sm border border-white/10">
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'quality' ? null : 'quality'); }}
                  className={`text-[11px] font-black tracking-[0.2em] uppercase pb-1 border-b-2 transition-colors capitalize ${activeMenu === 'quality' ? 'border-blue-500 text-white' : 'border-transparent text-white/60 hover:text-white'}`}
                >
                  Quality: {currentLevel === -1 ? 'Auto' : `${hlsLevels[currentLevel]?.height}p`}
                </button>

                {activeMenu === 'quality' && (
                  <div className="absolute bottom-full right-0 mb-4 w-44 bg-slate-900 border border-slate-700 rounded-lg flex flex-col p-4 shadow-2xl z-50 overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-700 pb-3 font-bold">Select Quality</span>
                    <button
                      onClick={() => switchQuality(-1)}
                      className={`text-left py-3 text-xs tracking-widest uppercase transition-all font-bold ${currentLevel === -1 ? 'text-blue-500 bg-blue-500/10 pl-2' : 'text-slate-300 hover:text-white hover:bg-slate-800 pl-1'}`}
                    >
                      Auto
                    </button>
                    {hlsLevels.map((level, idx) => (
                      <button
                        key={idx}
                        onClick={() => switchQuality(idx)}
                        className={`text-left py-3 text-xs tracking-widest uppercase transition-all font-bold ${currentLevel === idx ? 'text-blue-500 bg-blue-500/10 pl-2' : 'text-slate-300 hover:text-white hover:bg-slate-800 pl-1'}`}
                      >
                        {level.height}p
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white/70 hover:text-white text-2xl transition-colors font-black">
                {fullscreen ? '⊡' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}