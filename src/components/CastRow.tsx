import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Actor {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

interface CastRowProps {
  actors: Actor[];
}

const CastRow = ({ actors }: CastRowProps) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
            Top Cast
          </h2>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em]">
          VIEW_ALL
        </button>
      </div>

      <div className="flex gap-x-4 md:gap-x-6 overflow-x-auto pb-10 scrollbar-hide -mx-4 md:-mx-10 lg:-mx-16 px-4 md:px-10 lg:px-16 snap-x snap-mandatory">
        {actors.map((actor, index) => (
          <motion.div
            key={actor.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            className="flex-none group cursor-pointer flex-shrink-0 snap-start"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-indigo-500/50 shadow-2xl transition-all duration-500 relative z-10">
                {actor.avatar ? (
                  <img
                    src={actor.avatar}
                    alt={actor.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <User size={40} className="text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Outer Ring Decoration */}
              <div className="absolute -inset-2 border border-indigo-500/0 group-hover:border-indigo-500/20 rounded-full transition-all duration-500 scale-90 group-hover:scale-100" />
            </div>

            <div className="text-center space-y-1 md:space-y-2">
              <h3 className="text-white font-black text-sm md:text-lg group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter line-clamp-1">
                {actor.name}
              </h3>
              <p className="text-gray-500 text-[8px] md:text-xs font-black uppercase tracking-[0.2em] line-clamp-1">
                {actor.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CastRow;