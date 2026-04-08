import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onRate?: (value: number) => void;
  disabled?: boolean;
}

const RatingStars = ({ rating, onRate, disabled = false }: RatingStarsProps) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-2">
      {stars.map((value) => {
        const isActive = rating >= value;
        return (
          <motion.button
            key={value}
            type="button"
            whileHover={!disabled ? { scale: 1.2 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            className="rounded-full p-1"
            onClick={() => !disabled && onRate?.(value)}
            disabled={disabled}
          >
            <Star
              size={20}
              className={`transition-colors ${isActive ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]' : 'text-gray-500/70 hover:text-yellow-300'}`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default RatingStars;
