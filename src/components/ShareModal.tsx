import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Copy, Share2, X } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { getSocialLinks, type ShareMetadata } from '../services/shareService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ShareMetadata;
}

const ShareModal = ({ isOpen, onClose, metadata }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const links = getSocialLinks(metadata);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(metadata.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#070713]/95 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-300 font-black mb-2">Share the vibe</p>
                <h2 className="text-2xl font-black text-white">Invite friends to watch together</h2>
              </div>
              <button onClick={onClose} className="rounded-full p-3 bg-white/5 hover:bg-white/10 transition-all text-gray-300">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/5 p-4 mb-6">
              <div className="flex items-center gap-4">
                <img src={metadata.image} alt={metadata.title} className="w-16 h-16 rounded-3xl object-cover" />
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.25em] text-gray-400">{metadata.title}</p>
                  <p className="mt-1 text-sm text-gray-200 line-clamp-2">{metadata.description}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-between rounded-3xl bg-indigo-500 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-indigo-400"
              >
                <span>Copy Link</span>
                <span className="ml-3 rounded-full bg-black/10 p-2 text-white">
                  <Copy size={16} />
                </span>
              </button>
              <button
                onClick={() => window.open(links.facebook, '_blank')}
                className="flex items-center justify-between rounded-3xl bg-white/5 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
              >
                <span>Facebook</span>
                <span className="ml-3 rounded-full bg-blue-600/15 p-2 text-blue-300">
                  <FaFacebookF size={16} />
                </span>
              </button>
              <button
                onClick={() => window.open(links.twitter, '_blank')}
                className="flex items-center justify-between rounded-3xl bg-white/5 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
              >
                <span>Twitter</span>
                <span className="ml-3 rounded-full bg-sky-400/15 p-2 text-sky-300">
                  <FaTwitter size={16} />
                </span>
              </button>
              <button
                onClick={() => window.open(links.whatsapp, '_blank')}
                className="flex items-center justify-between rounded-3xl bg-white/5 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
              >
                <span>WhatsApp</span>
                <span className="ml-3 rounded-full bg-emerald-500/15 p-2 text-emerald-300">
                  <FaWhatsapp size={16} />
                </span>
              </button>
            </div>

            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-5 rounded-3xl bg-green-500/10 border border-green-400/20 px-4 py-3 text-sm text-green-200"
                >
                  Link copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-500">
              <Share2 size={14} />
              <span>Share this page with anyone — link generated dynamically.</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
