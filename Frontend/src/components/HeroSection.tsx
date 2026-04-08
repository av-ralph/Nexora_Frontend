import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export interface Movie {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  rating?: number;
  year?: string;
  genre?: string;
  mediaType?: 'movie' | 'tv';
}

export interface HeroSectionProps {
  movies: Movie[];
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.6 },
        scale: { duration: 1.2, ease: "easeOut" }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] lg:h-[75vh] min-h-[400px] md:min-h-[550px] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] group border border-white/10 shadow-2xl bg-[#050510]">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <motion.img
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6 }}
              src={currentMovie.imageUrl}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center"
            />
            
            {/* Cinematic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/90 via-[#050510]/40 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510] to-transparent z-20" />
          </div>

          {/* Content Container */}
          <div className="relative z-30 h-full flex flex-col justify-end p-6 md:p-12 lg:p-20 max-w-5xl space-y-6 md:space-y-8">
            {/* Metadata Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 md:gap-4"
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full">
                <Star className="w-2.5 h-2.5 md:w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span className="text-[9px] md:text-[10px] font-black text-indigo-300 tracking-wider uppercase">
                  {(currentMovie.rating || 8.5).toFixed(1)} Rating
                </span>
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">{currentMovie.year || '2024'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">{currentMovie.genre || 'Sci-Fi'}</span>
            </motion.div>

            {/* Title & Description */}
            <div className="space-y-3 md:space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 80 }}
                className="text-4xl md:text-3xl lg:text-3xl font-black text-white leading-[0.9] md:leading-[0.85] tracking-tighter uppercase italic drop-shadow-2xl"
              >
                {currentMovie.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm md:text-md text-gray-300 max-w-2xl line-clamp-2 md:line-clamp-3 font-medium leading-relaxed tracking-wide drop-shadow-md"
              >
                {currentMovie.description}
              </motion.p>
            </div>

            {/* Call to Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center gap-4 md:gap-6 pt-2"
            >
              <Link to={`/${currentMovie.mediaType || 'movie'}/${currentMovie.id}`} className="group relative flex items-center gap-3 bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm tracking-[0.1em] transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <Play fill="currentColor" size={16} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                <span>PLAY_NOW</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Navigation Controls */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 z-40 pointer-events-none">
        <button
          onClick={prevSlide}
          className="p-3 md:p-4 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/5 rounded-full text-white/50 hover:text-white transition-all pointer-events-auto active:scale-90"
        >
          <ChevronLeft size={24} className="md:w-8 md:h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 md:p-4 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/5 rounded-full text-white/50 hover:text-white transition-all pointer-events-auto active:scale-90"
        >
          <ChevronRight size={24} className="md:w-8 md:h-8" />
        </button>
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`group relative h-1.5 transition-all duration-500 rounded-full ${
              currentIndex === index ? 'w-10 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          >
            {currentIndex === index && (
              <motion.div
                layoutId="activeDot"
                className="absolute inset-0 bg-indigo-400 blur-sm opacity-50 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Futuristic Accents */}
      <div className="absolute top-8 right-8 z-30 hidden lg:block">
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-indigo-500/50 tracking-[0.5em] uppercase">System_Status</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
          </div>
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
