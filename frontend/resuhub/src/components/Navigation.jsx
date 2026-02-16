import React, { useState } from 'react';
import { Bell, ChevronDown, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = displayName[0]?.toUpperCase() || 'U';

  const navItems = [
    { label: 'Dashboard', path: '/', emoji: '📊' },
    { label: 'Versions', path: '/versions', emoji: '🔄' },
    { label: 'Resumes', path: '/resumes', emoji: '📄' },
    { label: 'AI Review', path: '/ai-review', emoji: '✨' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card-strong" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
      <div className="max-w-[1400px] mx-auto px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-5 group">
            <div className="relative cursor-pointer">
              {/* Breathing glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" style={{ animation: 'pulseDot 3s ease-in-out infinite' }}></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight gradient-text-animated">
                ResuHub
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Resume Intelligence</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: 'rgba(15,15,40,0.5)', border: '1px solid rgba(99,102,241,0.08)' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-500 flex items-center gap-2 ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="text-xs">{item.emoji}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="pulse-dot w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/5" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
              <Bell className="w-4.5 h-4.5 text-slate-400" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/5"
                style={{ border: '1px solid rgba(99,102,241,0.1)' }}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/30">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">{initial}</div>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-300">{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 glass-card-strong z-50 overflow-hidden" style={{ animation: 'staggerFadeIn 0.2s var(--ease-out-expo) forwards', borderRadius: '16px' }}>
                    <div className="p-4 border-b border-white/5">
                      <p className="font-bold text-sm text-white">{displayName}</p>
                      <p className="text-xs text-slate-500">{user?.email || ''}</p>
                    </div>
                    <div className="py-1">
                      {['Settings', 'Help Center'].map(item => (
                        <button key={item} className="w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium">
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-white/5">
                      <button
                        onClick={() => { setShowProfileMenu(false); signOut(); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 transition-all font-medium flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;