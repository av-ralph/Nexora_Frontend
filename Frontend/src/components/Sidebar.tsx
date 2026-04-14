import { Home, Compass, Clock, Heart, Settings, LogOut, Search, Activity, Cpu, X, Command, Star, Loader2, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { multiSearch } from '../api/tmdb';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  backdrop_path?: string;
  media_type?: string;
}

const Sidebar = ({ isOpen = true, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Debounced search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await multiSearch(searchQuery);
          setSearchResults(results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 6)); // Show top 6 results
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminUser");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Search, label: 'Search', path: '/search', isAction: true },
  ];

  const libraryItems = [
    { icon: Clock, label: 'History', path: '/recent' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
  ];

  const NavItem = ({ icon: Icon, label, path, isAction }: any) => {
    const isActive = location.pathname === path;

    const content = (
      <div
        className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden cursor-pointer ${
          isActive 
            ? 'text-white bg-white/[0.08] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-md' 
            : 'text-gray-500 hover:text-white hover:bg-white/[0.05] hover:border-white/10 border border-transparent'
        }`}
        onClick={() => {
          if (isAction && label === 'Search') {
            setIsSearchOpen(true);
          }
          if (onClose) onClose();
        }}
      >
        {isActive && (
          <>
            <motion.div
              layoutId="activeNav"
              className="absolute left-0 w-1.5 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent" />
          </>
        )}

        <Icon size={20} className={`transition-all duration-500 ${isActive ? 'text-indigo-400' : 'group-hover:scale-110 group-hover:text-white'}`} />

        <span className={`text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 ${isActive ? 'tracking-[0.4em]' : 'group-hover:tracking-[0.4em]'}`}>
          {label}
        </span>

        {/* Shine effect on hover */}
        {!isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
      </div>
    );

    if (isAction) {
      return content;
    }

    return (
      <Link to={path}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-screen 
          w-[280px] 
          bg-white/[0.01] backdrop-blur-[32px] 
          border-r border-white/10
          flex flex-col z-50
          transition-all duration-500 ease-in-out
          lg:translate-x-0
          overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-white/[0.02] before:pointer-events-none
          ${isOpen ? 'translate-x-0 shadow-[20px_0_80px_rgba(0,0,0,0.6)]' : '-translate-x-full'}
        `}
      >
      {/* Logo */}
      <div className="p-8 lg:p-10 mb-4 lg:mb-8 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-4 group" onClick={onClose}>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-white rotate-45 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>
          <span className="text-xl lg:text-3xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">NEXORA</span>
        </Link>

        {/* Close button for mobile */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6 lg:space-y-8">
        <div>
          <p className="text-[9px] text-indigo-400/60 uppercase tracking-[0.4em] px-2 mb-3">
            System
          </p>

          {menuItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>

        <div>
          <p className="text-[9px] text-indigo-400/60 uppercase tracking-[0.4em] px-2 mb-3">
            Library
          </p>

          {libraryItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-6 border-t border-white/5 space-y-2">
        {user ? (
          <>
            <NavItem icon={Settings} label="Settings" path="/settings" />

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-4 px-6 py-4 text-gray-500 hover:text-red-400 w-full transition-all group rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black group-hover:tracking-[0.4em] transition-all">
                Logout
              </span>
            </button>
          </>
        ) : (
          <Link to="/login">
            <div className="flex items-center space-x-4 px-6 py-4 text-gray-500 hover:text-indigo-400 w-full transition-all group rounded-2xl hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20">
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform rotate-180" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black group-hover:tracking-[0.4em] transition-all">
                Login
              </span>
            </div>
          </Link>
        )}
      </div>
    </aside>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl"
            >
              <div className="p-8 md:p-12 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Search size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Search_Interface</h2>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-1">Global_Neural_Query</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Input Area */}
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search size={24} className="text-indigo-500/50 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        const firstResult = searchResults[0];
                        navigate(`/${firstResult.media_type || 'movie'}/${firstResult.id}`);
                        setIsSearchOpen(false);
                      }
                    }}
                    placeholder="Search for movies, TV shows, or actors..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-7 pl-20 pr-32 md:pr-40 text-xl font-medium text-white placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all shadow-[0_0_50px_rgba(0,0,0,0.3)] group-hover:bg-white/10"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center space-x-4">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl pointer-events-none">
                      <Command size={12} className="text-gray-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enter</span>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 size={40} className="text-indigo-500 animate-spin" />
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Querying_Database...</p>
                    </div>
                  ) : searchQuery.length > 1 && searchResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Top_Matches</span>
                        <div className="h-px flex-1 bg-white/5 mx-6" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map((movie) => (
                          <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => {
                              navigate(`/${movie.media_type || 'movie'}/${movie.id}`);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer transition-all group"
                          >
                            <div className="w-16 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                              {movie.poster_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                  alt={movie.title || movie.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Cpu size={24} className="text-gray-700" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{movie.title || movie.name}</h3>
                                {movie.media_type && (
                                  <span className="text-[8px] font-black px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md uppercase tracking-widest border border-indigo-500/20">
                                    {movie.media_type}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 mt-2">
                                <div className="flex items-center space-x-1 text-indigo-400">
                                  <Star size={10} fill="currentColor" />
                                  <span className="text-[10px] font-black tracking-widest">{movie.vote_average.toFixed(1)}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">
                                  {(movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A'}
                                </span>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-700 group-hover:text-indigo-500 transition-colors" />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : searchQuery.length > 1 && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">No_Matches_Found</p>
                      <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-2">Try searching for something else</p>
                    </div>
                  ) : (
                    <>
                      {/* Suggested Queries */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Suggested_Queries</span>
                          <div className="h-px flex-1 bg-white/5 mx-6" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {['Inception', 'Cyberpunk', 'Space Odyssey', 'Noir', 'The Matrix', 'Interstellar'].map((tag, index) => (
                            <motion.button
                              key={tag}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => setSearchQuery(tag)}
                              className="px-6 py-2 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/30 rounded-full text-[10px] font-black text-gray-400 hover:text-indigo-400 uppercase tracking-widest transition-all"
                            >
                              {tag}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Decorative Footer */}
              <div className="bg-indigo-600/5 border-t border-white/5 p-4 flex justify-center">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-indigo-500/50 uppercase tracking-[0.5em]">System_Ready_for_Query</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;