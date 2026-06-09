export default function EditorialGrid({ title, movies, onPlay, onAddWatchlist, watchlistIds = new Set() }) {
  if (!movies?.length) return null;

  return (
    <section className="mb-20 px-6 md:px-10">
      {/* Section header */}
      <div className="flex justify-between items-end mb-8 pb-4 border-b border-slate-200">
        <h2 className="display-font text-3xl md:text-4xl text-slate-900 uppercase tracking-tighter font-black">
          {title}
        </h2>
        <span className="text-slate-500 text-[10px] tracking-[0.5em] uppercase hidden md:block font-bold">
          {movies.length} titles
        </span>
      </div>

      {/* Asymmetric grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px] md:auto-rows-[280px]">
        {movies.map((movie, idx) => {
          // Feature every 6th item (idx 0, 6, 12…) spanning 2 cols + 2 rows
          const isFeatured = idx === 0 || idx % 7 === 0;
          return (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFeatured={isFeatured}
              onPlay={onPlay}
              onAddWatchlist={onAddWatchlist}
              inWatchlist={watchlistIds.has(movie.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

function MovieCard({ movie, isFeatured, onPlay, onAddWatchlist, inWatchlist }) {
  return (
    <div
      className={`group relative cursor-pointer border border-slate-200 bg-white shadow-md rounded-md overflow-hidden transition-all duration-500
        ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
      onClick={() => onPlay(movie)}
    >
      {/* Poster / backdrop */}
      {(movie.thumbnail_url || movie.backdrop_url) ? (
        <img
          src={isFeatured ? (movie.backdrop_url || movie.thumbnail_url) : movie.thumbnail_url}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        /* Fallback light block */
        <div className="absolute inset-0 bg-slate-100" />
      )}

      {/* Gradient overlay - Required to keep white text readable over random images */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Metadata */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {movie.rating && (
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm">
              {movie.rating}
            </span>
          )}
          {movie.is_trending && (
            <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-bold rounded-sm">
              Trending
            </span>
          )}
          {movie.award_winning && (
            <span className="bg-amber-500/80 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-bold rounded-sm">
              ★ Award
            </span>
          )}
        </div>

        <h3 className={`display-font font-black text-white uppercase leading-none mb-2
          ${isFeatured ? 'text-2xl md:text-3xl' : 'text-base md:text-xl'}`}
        >
          {movie.title}
        </h3>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-slate-300 text-[10px] tracking-widest">{movie.release_year}</span>
          {movie.duration_mins > 0 && (
            <span className="text-slate-300 text-[10px]">{movie.duration_mins} min</span>
          )}
          {movie.language && (
            <span className="text-slate-300 text-[10px] tracking-widest uppercase">{movie.language}</span>
          )}
        </div>
      </div>

      {/* Play overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-14 h-14 border border-white/40 rounded-full flex items-center justify-center bg-blue-600/60 backdrop-blur-sm transition-transform group-hover:scale-110">
          <span className="text-white text-xl pl-1">▶</span>
        </div>
      </div>

      {/* Watchlist button (top-right) */}
      {onAddWatchlist && (
        <button
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-xs border rounded-full opacity-0 group-hover:opacity-100 transition-all z-10
            ${inWatchlist
              ? 'border-blue-600 text-blue-600 bg-blue-50/90'
              : 'border-white/60 text-white hover:border-white hover:bg-black/40 bg-black/20 backdrop-blur-sm'
            }`}
          onClick={(e) => { e.stopPropagation(); onAddWatchlist(movie); }}
          title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        >
          {inWatchlist ? '✓' : '+'}
        </button>
      )}
    </div>
  );
}