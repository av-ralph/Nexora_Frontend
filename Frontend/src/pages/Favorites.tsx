import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Play, Trash2, Film, ChevronRight, Menu, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getFavorites, removeFavoriteByUserAndMovie } from '../api/backend';
import Sidebar from '../components/Sidebar';
import Scene from '../components/ThreeBackground';
import heroBg from '../assets/BG1.gif';

interface FavoriteMovie {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string;
  media_type: string;
  created_at: string;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const fetchFavorites = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    setUserId(session.user.id);

    try {
      const data = await getFavorites(session.user.id);
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Fallback to Supabase if backend fails
      const { data, error: supaError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!supaError) setFavorites(data || []);
    }
    setLoading(false);
    setIsSyncing(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, [navigate]);

  const removeFavorite = async (movieId: number) => {
    setRemovingId(movieId);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    try {
      await removeFavoriteByUserAndMovie(session.user.id, movieId);
      setFavorites(prev => prev.filter(m => m.movie_id !== movieId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Fallback to Supabase
      const { error: supaError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('movie_id', movieId);

      if (!supaError) {
        setFavorites(prev => prev.filter(m => m.movie_id !== movieId));
      }
    }
    setRemovingId(null);
  };

  const clearAllFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id);

    if (!error) {
      setFavorites([]);
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="flex min-h-screen text-white overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      {/* Background Layers */}
      <div className="fixed inset-0 -z-20">
        <img src={heroBg} className="w-full h-full object-cover opacity-20" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-transparent to-[#050510]" />
      </div>
      <Scene />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#0a0a16] border border-red-500/20 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Wipe_Archive?</h3>
              <p className="text-sm text-gray-500 font-medium mb-8">This will permanently delete all nodes from your neural collection. This action cannot be reversed.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Abort_Process
                </button>
                <button 
                  onClick={clearAllFavorites}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
                >
                  Confirm_Wipe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-20 px-6 flex items-center justify-between z-30 lg:hidden bg-[#050510]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-xl text-white">
          <Menu size={20} />
        </button>
        <span className="text-xl font-black tracking-tighter italic">NEXORA // FAVS</span>
        <div className="w-10" />
      </div>

      <main className="flex-1 lg:pl-[280px] relative z-10">
        <div className="px-6 md:px-12 lg:px-16 py-10 lg:py-16">
          <div className="max-w-[1600px] mx-auto">
            
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 pt-16 lg:pt-0"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Heart size={20} fill="white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">My_Archive</h1>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">Personal_Neural_Collection</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => fetchFavorites(true)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-gray-400 hover:text-white"
                  >
                    <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                  </button>
                  {favorites.length > 0 && (
                    <button 
                      onClick={() => setShowClearConfirm(true)}
                      className="px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Clear_Archive
                    </button>
                  )}
                </div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-indigo-500/50 to-transparent mt-4" />
            </motion.header>

            {loading ? (
              <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retrieving_Data_Nodes...</p>
              </div>
            ) : favorites.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {favorites.map((movie) => (
                    <motion.div
                      key={movie.movie_id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      className="group relative aspect-[2/3] bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all duration-500"
                    >
                      {movie.movie_poster ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${movie.movie_poster}`} 
                          alt={movie.movie_title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-700">NO_DATA</div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                        <h3 className="text-xs font-black uppercase italic tracking-tighter mb-4 line-clamp-2">{movie.movie_title}</h3>
                        
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/${movie.media_type || 'movie'}/${movie.movie_id}`}
                            className="flex-1 bg-white text-black py-2 rounded-xl flex items-center justify-center text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            <Play size={12} fill="currentColor" className="mr-2" />
                            Access
                          </Link>
                          <button 
                            onClick={() => removeFavorite(movie.movie_id)}
                            disabled={removingId === movie.movie_id}
                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {removingId === movie.movie_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Decorative Tech Accents */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,1)]" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-700">
                  <Film size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-400">Archive_Empty</h2>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto uppercase font-bold tracking-widest leading-relaxed">
                    No data nodes found in your collection. Start exploring the Nexora system.
                  </p>
                </div>
                <Link 
                  to="/explore"
                  className="group flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                >
                  <span>Explore Films</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 md:px-12 lg:px-16 pb-12 mt-auto">
          <div className="flex items-center space-x-4 opacity-20">
            <div className="h-px flex-1 bg-white" />
            <span className="text-[8px] font-black uppercase tracking-[1em]">Secure_Storage_Active</span>
            <div className="h-px flex-1 bg-white" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Favorites;