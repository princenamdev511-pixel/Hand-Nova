import React from 'react';
import { Hand, Palette, LogIn, LogOut } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
}) {
  const tabClass = (tab) =>
    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
      activeTab === tab
        ? 'border border-violet-200 bg-violet-50 text-violet-800 shadow-sm'
        : 'text-stone-600 hover:bg-violet-50/60 hover:text-violet-800'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-3 text-left"
          onClick={() => setActiveTab('studio')}
          aria-label="Go to Hand Nova Studio"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-violet-500/20 ring-1 ring-violet-200/70">
            <Hand className="h-5 w-5 text-white" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />
          </div>

          <div>
            <span className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
              Hand <span className="text-violet-700">Nova</span>
            </span>
            <p className="hidden text-[11px] font-medium tracking-wide text-stone-500 sm:block">
              Gesture & Air capture Nova 
            </p>
          </div>
        </button>

        <div className="ml-auto hidden items-center gap-3 md:flex lg:gap-4">
          <nav className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50/80 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={tabClass('studio')}
            >
              <Hand className="h-4 w-4" />
              <span>Live Capture</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={tabClass('gallery')}
            >
              <Palette className="h-4 w-4" />
              <span>My Artwork</span>
            </button>
          </nav>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-200 bg-violet-100 text-xs font-bold text-violet-800">
                  {user.username
                    ? user.username.charAt(0).toUpperCase()
                    : 'U'}
                </div>

                <span className="max-w-[110px] truncate text-xs font-semibold text-stone-700">
                  {user.username}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-transparent p-2.5 text-stone-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-2 md:hidden">
            <span className="max-w-[85px] truncate text-xs font-medium text-stone-600">
              {user.username}
            </span>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-stone-200 p-2 text-stone-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-violet-500/15 transition-colors hover:from-violet-600 hover:to-fuchsia-500 md:hidden"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <div className="flex justify-around border-t border-stone-200/80 bg-white px-2 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`flex min-w-28 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-all ${
            activeTab === 'studio'
              ? 'bg-violet-50 font-semibold text-violet-800'
              : 'text-stone-500 hover:bg-stone-50'
          }`}
        >
          <Hand
            className={`h-5 w-5 ${
              activeTab === 'studio' ? 'text-violet-700' : ''
            }`}
          />
          <span>Live Capture</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`flex min-w-28 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-all ${
            activeTab === 'gallery'
              ? 'bg-amber-50 font-semibold text-amber-800'
              : 'text-stone-500 hover:bg-stone-50'
          }`}
        >
          <Palette
            className={`h-5 w-5 ${
              activeTab === 'gallery' ? 'text-amber-600' : ''
            }`}
          />
          <span>My Artwork</span>
        </button>
      </div>
    </header>
  );
}
