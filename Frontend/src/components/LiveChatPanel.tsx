import { useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { sendChatMessage, type WatchPartyRoom, type WatchPartyUser } from '../services/watchPartyService';

interface LiveChatPanelProps {
  room: WatchPartyRoom;
  currentUser: WatchPartyUser;
}

const reactions = ['🔥', '🎉', '😂', '👏', '❤️'];

const LiveChatPanel = ({ room, currentUser }: LiveChatPanelProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const participantCount = room.participants.length;

  const shortcutReaction = async (reactionEmoji: string) => {
    try {
      await sendChatMessage(room.roomId, currentUser, reactionEmoji);
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  const chat = room.chatMessages;

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);

    try {
      await sendChatMessage(room.roomId, currentUser, message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const guestCount = useMemo(() => room.participants.map((participant) => participant.name).join(', '), [room.participants]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col h-full">
      <div className="bg-[#090920] px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-300 font-black mb-2">Live Chat</p>
            <h3 className="text-xl font-black text-white">Watch Party Lounge</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[11px] text-gray-300">
            <User size={14} /> {participantCount} online
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">{guestCount.slice(0, 100)}{guestCount.length > 100 ? '...' : ''}</p>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-4">
        <AnimatePresence mode="popLayout">
          {chat.map((messageItem) => (
            <motion.div
              key={messageItem.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-200 font-black uppercase text-xs">
                    {messageItem.userName.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{messageItem.userName}</p>
                    <p className="text-[10px] text-gray-500">{new Date(messageItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className="text-[12px] text-gray-400">{messageItem.text.startsWith('🔥') ? 'Reaction' : ''}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-200">{messageItem.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/10 bg-[#090920] p-5">
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
          {reactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => shortcutReaction(emoji)}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xl transition-all hover:bg-white/10"
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-3">
          <label htmlFor="chatInput" className="sr-only">Type your message</label>
          <input
            id="chatInput"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message to friends..."
            className="flex-1 rounded-[2rem] border border-white/10 bg-[#070713] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-500 px-5 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChatPanel;
