import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Trash2, Star, X, ExternalLink, MessageSquare, User, Calendar, Filter } from "lucide-react";
import { getAdminReviews, deleteAdminReview, type AdminReview } from "../../api/admin";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [movieId, setMovieId] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAdminReviews(
        page,
        limit,
        search || undefined,
        movieId ? parseInt(movieId) : undefined
      );
      setReviews(data.reviews);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, search, movieId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteAdminReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2">
            Neural_Feedback
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">
            User_Sentiment_Analysis
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search_Neural_Logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-12 pr-6 py-4 w-full sm:w-64 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Movie_ID_Node..."
              value={movieId}
              onChange={(e) => { setMovieId(e.target.value); setPage(1); }}
              className="pl-12 pr-6 py-4 w-full sm:w-40 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Reviews Grid/List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/[0.03] border border-white/10 rounded-[2.5rem]">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Decoding_Neural_Streams...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/[0.03] border border-white/10 rounded-[2.5rem]">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">No_Neural_Inputs_Found</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={review.id}
              className="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 hover:bg-white/[0.06] transition-all duration-500"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Author Info */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <span className="text-white font-black text-xl">
                        {review.author_name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight mb-1">
                        {review.author_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-amber-400">
                        {[...Array(10)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={8} 
                            className={i < review.rating ? "fill-current" : "text-gray-700"} 
                          />
                        ))}
                        <span className="text-[10px] font-black ml-1">{review.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <Calendar size={12} className="text-indigo-500" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <MessageSquare size={12} className="text-purple-500" />
                      ID: {review.id.slice(0, 8)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                          Target_Media
                        </span>
                        <a
                          href={`/movie/${review.movie_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-indigo-400 transition-colors"
                        >
                          Node_{review.movie_id}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                        title="Purge_Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed italic relative">
                      <span className="absolute -left-4 -top-2 text-4xl text-white/5 font-serif">"</span>
                      {review.content}
                      <span className="absolute -right-4 bottom-0 text-4xl text-white/5 font-serif">"</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-10 py-8 bg-white/[0.03] border border-white/10 rounded-[2rem]">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Segment_Range: <span className="text-white">{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</span> / {total}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                Node_{page} / {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
