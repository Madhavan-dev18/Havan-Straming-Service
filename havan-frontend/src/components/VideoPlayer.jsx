import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ streamUrl, posterUrl, title, onProgress, onClose }) {
  const videoRef      = useRef(null);
  const containerRef  = useRef(null);
  const progressTimer = useRef(null);

  const [playing,    setPlaying]    = useState(false);
  const [muted,      setMuted]      = useState(false);
  const [volume,     setVolume]     = useState(1);
  const [currentTime,setCurrentTime]= useState(0);
  const [duration,   setDuration]   = useState(0);
  const [buffered,   setBuffered]   = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCtrl,   setShowCtrl]   = useState(true);
  const [loading,    setLoading]    = useState(true);
  const hideTimer = useRef(null);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const resetHideTimer = useCallback(() => {
    setShowCtrl(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowCtrl(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => setLoading(false));
    }

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onPlay  = () => setPlaying(true);
    const onPause = () => { setPlaying(false); setShowCtrl(true); };

    video.addEventListener('timeupdate',    onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play',  onPlay);
    video.addEventListener('pause', onPause);

    progressTimer.current = setInterval(() => {
      if (video.currentTime > 0 && onProgress) {
        onProgress(Math.floor(video.currentTime), video.ended);
      }
    }, 10000);

    return () => {
      hls?.destroy();
      clearInterval(progressTimer.current);
      clearTimeout(hideTimer.current);
      video.removeEventListener('timeupdate',    onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play',  onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [streamUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    v.paused ? v.play() : v.pause();
    resetHideTimer();
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const skip = (secs) => {
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + secs));
    resetHideTimer();
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        background: '#000',
        borderRadius: fullscreen ? 0 : '12px',
        overflow: 'hidden',
        cursor: showCtrl ? 'default' : 'none',
      }}
    >
      <video
        ref={videoRef}
        poster={posterUrl}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Loading spinner */}
      {loading && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)' }}>
          <div style={{ width:48, height:48, border:'3px solid rgba(255,255,255,0.2)', borderTop:'3px solid #1a6cf6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Controls overlay */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          background: showCtrl ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' : 'transparent',
          opacity: showCtrl ? 1 : 0,
          transition: 'opacity 0.3s ease',
          padding: '0 20px 16px',
        }}
      >
        {/* Title row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <span style={{ color:'#fff', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:16 }}>{title}</span>
          {onClose && (
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16 }}>✕</button>
          )}
        </div>

        {/* Progress bar */}
        <div
          onClick={seek}
          style={{ height:4, background:'rgba(255,255,255,0.2)', borderRadius:2, cursor:'pointer', marginBottom:12, position:'relative' }}
        >
          <div style={{ position:'absolute', height:'100%', width:`${buffered}%`, background:'rgba(255,255,255,0.3)', borderRadius:2 }} />
          <div style={{ position:'absolute', height:'100%', width:`${progress}%`, background:'#1a6cf6', borderRadius:2, transition:'width 0.1s' }}>
            <div style={{ position:'absolute', right:-6, top:'50%', transform:'translateY(-50%)', width:12, height:12, background:'#1a6cf6', borderRadius:'50%', boxShadow:'0 0 0 3px rgba(26,108,246,0.3)' }} />
          </div>
        </div>

        {/* Buttons row */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <CtrlBtn onClick={togglePlay} label={playing ? '⏸' : '▶'} />
          <CtrlBtn onClick={() => skip(-10)} label='⟨10' small />
          <CtrlBtn onClick={() => skip(10)}  label='10⟩' small />

          {/* Volume */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <CtrlBtn onClick={() => { setMuted(!muted); videoRef.current.muted = !muted; }} label={muted ? '🔇' : '🔊'} small />
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={e => { setVolume(+e.target.value); videoRef.current.volume = +e.target.value; }}
              style={{ width:70, accentColor:'#1a6cf6' }}
            />
          </div>

          <span style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginLeft:4 }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div style={{ marginLeft:'auto' }}>
            <CtrlBtn onClick={toggleFullscreen} label={fullscreen ? '⤓' : '⤢'} small />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CtrlBtn({ onClick, label, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        width:  small ? 32 : 44,
        height: small ? 32 : 44,
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: small ? 13 : 18,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'background 0.2s',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}