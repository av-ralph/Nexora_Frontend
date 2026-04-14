import { motion } from 'framer-motion';
import { Heart, Edit3, Trash2, Star } from 'lucide-react';
import { type Review } from '../services/reviewService';

interface ReviewCardProps {
  review: Review;
  currentUserId: string;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onToggleLike: (reviewId: string) => void;
}

const ReviewCard = ({ review, currentUserId, onEdit, onDelete, onToggleLike }: ReviewCardProps) => {
  const isOwner = review.authorId === currentUserId;
  const likedByCurrentUser = review.likedBy.includes(currentUserId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-300 font-black uppercase text-xs">
              {review.authorName.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white">{review.authorName}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-yellow-300">
            {[...Array(5)].map((_, index) => (
              <Star key={index} size={14} className={index < review.rating ? 'opacity-100' : 'opacity-20'} />
            ))}
            <span className="text-[11px] font-bold text-gray-300">{review.rating}.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLike(review.id)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold transition-all ${likedByCurrentUser ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
          >
            <Heart size={14} className={`${likedByCurrentUser ? 'text-red-400' : 'text-gray-300'}`} />
            <span>{review.likes}</span>
          </button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(review)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-gray-300">
                <Edit3 size={14} />
              </button>
              <button onClick={() => onDelete(review.id)} className="p-2 rounded-full bg-white/5 hover:bg-red-500/15 transition-all text-gray-300">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-gray-200">{review.content}</p>
      {review.updatedAt !== review.createdAt && (
        <p className="mt-3 text-[11px] text-gray-500 uppercase tracking-[0.2em]">Edited • {new Date(review.updatedAt).toLocaleString()}</p>
      )}
    </motion.div>
  );
};

export default ReviewCard;
