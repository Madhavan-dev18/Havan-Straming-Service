import { useState } from 'react';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Recently Added' },
  { value: '-popularity', label: 'Most Popular'   },
  { value: '-release_year', label: 'Newest First'  },
  { value: 'release_year',  label: 'Oldest First'  },
  { value: 'title',         label: 'A–Z'           },
];

const CATEGORY_PILLS = [
  { value: '',              label: 'All'          },
  { value: 'trending',      label: 'Trending'     },
  { value: 'award_winning', label: '★ Award'      },
  { value: 'family_friendly', label: 'Family'     },
  { value: 'recently_added', label: 'New'         },
];

const RATING_OPTIONS = ['', 'G', 'PG', 'PG-13', 'R', 'NC-17'];

export default function FilterBar({ genres, filters, onChange }) {
  const [open, setOpen] = useState(false);

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="px-6 md:px-10 mb-10 relative z-20">
      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORY_PILLS.map(pill => (
          <button
            key={pill.value}
            onClick={() => set('category', pill.value)}
            className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-black border transition-all duration-200 rounded-md
              ${filters.category === pill.value
                ? 'border-blue-600 text-blue-600 bg-blue-50 shadow-sm'
                : 'bg-white border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 shadow-sm'
              }`}
          >
            {pill.label}
          </button>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-black border transition-all duration-200 ml-auto rounded-md shadow-sm
            ${open
              ? 'border-blue-600 text-blue-600 bg-blue-50'
              : 'bg-white border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600'
            }`}
        >
          {open ? '▲ Filters' : '▼ Filters'}
        </button>
      </div>

      {/* Expanded filter panel */}
      {open && (
        <div className="border border-slate-200 p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-4 bg-white rounded-xl shadow-lg">
          {/* Genre */}
          <div>
            <label className="text-[9px] tracking-[0.4em] text-slate-500 uppercase block mb-2 font-bold">Genre</label>
            <select
              value={filters.genre || ''}
              onChange={e => set('genre', e.target.value)}
              className="w-full p-3 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none text-xs tracking-wide rounded-md"
            >
              <option value="">All Genres</option>
              {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="text-[9px] tracking-[0.4em] text-slate-500 uppercase block mb-2 font-bold">Language</label>
            <select
              value={filters.language || ''}
              onChange={e => set('language', e.target.value)}
              className="w-full p-3 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none text-xs tracking-wide rounded-md"
            >
              <option value="">All Languages</option>
              {['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'Japanese', 'Korean'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-[9px] tracking-[0.4em] text-slate-500 uppercase block mb-2 font-bold">Rating</label>
            <select
              value={filters.rating || ''}
              onChange={e => set('rating', e.target.value)}
              className="w-full p-3 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none text-xs tracking-wide rounded-md"
            >
              {RATING_OPTIONS.map(r => <option key={r} value={r}>{r || 'All Ratings'}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="text-[9px] tracking-[0.4em] text-slate-500 uppercase block mb-2 font-bold">Sort By</label>
            <select
              value={filters.sort || '-created_at'}
              onChange={e => set('sort', e.target.value)}
              className="w-full p-3 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none text-xs tracking-wide rounded-md"
            >
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="text-[9px] tracking-[0.4em] text-slate-500 uppercase block mb-2 font-bold">Search</label>
            <input
              type="text"
              placeholder="Search titles..."
              value={filters.search || ''}
              onChange={e => set('search', e.target.value)}
              className="w-full p-3 bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 outline-none text-xs tracking-wide placeholder-slate-400 rounded-md"
            />
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => onChange({ category: '', genre: '', language: '', rating: '', search: '', sort: '-created_at' })}
              className="w-full btn-brutal bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 py-3 text-[10px] tracking-[0.2em] rounded-md font-bold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}