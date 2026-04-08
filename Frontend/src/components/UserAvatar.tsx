import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserAvatarProps {
  user: any;
  onSignOut: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=fff`;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-1 pr-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 backdrop-blur-xl"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-lg border border-white/10">
          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[10px] font-black text-white/90 uppercase tracking-widest truncate max-w-[100px]">
            {fullName}
          </p>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              style={{ perspective: "1000px" }}
              className="absolute right-0 mt-4 w-64 bg-[#0a0a16]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right"
            >
              <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500/50 p-0.5">
                    <img src={avatarUrl} alt={fullName} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white truncate">{fullName}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight truncate opacity-80">{user?.email}</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 space-y-1">
                {[
                  { to: "/home", icon: LayoutDashboard, label: "Dashboard" },
                  { to: "/profile", icon: UserIcon, label: "Profile" },
                  { to: "/settings", icon: Settings, label: "Settings" }
                ].map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <item.icon size={18} className="group-hover:text-indigo-400 transition-colors relative z-10" />
                      <span className="text-xs font-black uppercase tracking-[0.15em] relative z-10">{item.label}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-3 border-t border-white/5 bg-red-500/[0.02]">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    setIsOpen(false);
                    onSignOut();
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group"
                >
                  <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-[0.15em]">Terminate Session</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAvatar;
