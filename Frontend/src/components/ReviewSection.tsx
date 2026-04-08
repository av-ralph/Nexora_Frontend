import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocial } from '../context/SocialContext';
import { type Review } from '../services/reviewService';
import { supabase } from '../lib/supabase';
import RatingStars from './RatingStars';
import ReviewCard from './ReviewCard';

interface ReviewSectionProps {
  movieId: number;
  movieTitle: string;
}

const ReviewSection = ({ movieId, movieTitle }: ReviewSectionProps) => {
  const social = useSocial();
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('newest');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState('guest');
  const [currentUserName, setCurrentUserName] = useState('Guest');
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
        setCurrentUserName(data.session.user.email?.split('@')[0] ?? 'NexoraFan');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadReviewsAndStats = async () => {
      setLoading(true);
      try {
        const [reviewsData, statsData] = await Promise.all([
          social.getMovieReviews(movieId, sortBy),
          social.getMovieStats(movieId),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviewsAndStats();
  }, [movieId, sortBy, social]);

  const resetForm = () => {
    setRating(0);
    setContent('');
    setEditingReview(null);
  };

  const handleSubmit = async () => {
    if (!rating || !content.trim()) return;
    setSaving(true);

    try {
      if (editingReview) {
        await social.editReview(editingReview.id, currentUserId, rating, content.trim());
      } else {
        await social.createReview(movieId, currentUserId, currentUserName, rating, content.trim());
      }

      resetForm();
      // Reload reviews after submission
      const [reviewsData, statsData] = await Promise.all([
        social.getMovieReviews(movieId, sortBy),
        social.getMovieStats(movieId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setContent(review.content);
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await social.removeReview(reviewId, currentUserId);
      // Reload reviews after deletion
      const [reviewsData, statsData] = await Promise.all([
        social.getMovieReviews(movieId, sortBy),
        social.getMovieStats(movieId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    try {
      await social.likeReview(reviewId, currentUserId);
      // Reload reviews after like toggle
      const [reviewsData, statsData] = await Promise.all([
        social.getMovieReviews(movieId, sortBy),
        social.getMovieStats(movieId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <section className="relative z-10 px-4 md:px-12 lg:px-24 pb-20 pt-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-baseline gap-4 mb-4">
            <div className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">Reviews</div>
            <span className="rounded-full bg-indigo-500/10 text-indigo-200 px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-black">{stats.totalReviews} responses</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
            Add your rating and review for {movieTitle}. Your feedback powers the community and improves watch predictions.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Average Rating</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-white">{stats.averageRating || '0.0'}</span>
                <span className="text-sm text-gray-400">/ 5.0</span>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Sort Reviews</span>
              <div className="flex gap-2">
                {(['newest', 'top'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSortBy(option)}
                    className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all ${sortBy === option ? 'bg-indigo-500 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    {option === 'newest' ? 'Newest' : 'Top Rated'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Leave your review</h3>
            {editingReview && <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-300">Editing</span>}
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Your rating</span>
              <div className="mt-2">
                <RatingStars rating={rating} onRate={setRating} />
              </div>
            </div>
            <div>
              <label className="sr-only" htmlFor="reviewText">Review content</label>
              <textarea
                id="reviewText"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="Share what you loved about the experience..."
                className="w-full rounded-[1.5rem] border border-white/10 bg-[#04040f] px-4 py-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <button
                onClick={handleSubmit}
                disabled={saving || !rating || !content.trim()}
                className="rounded-full bg-indigo-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-400"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              {editingReview && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] uppercase tracking-[0.25em] text-gray-400 hover:text-gray-100 transition-colors"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="wait">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))}
        </AnimatePresence>
        {!reviews.length && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-gray-400"
          >
            No reviews yet. Be the first to start the conversation.
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
