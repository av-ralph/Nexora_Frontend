import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Users, Share2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { joinRoom, leaveRoom, subscribeToRoom, type WatchPartyRoom as RoomType, type WatchPartyUser } from '../services/watchPartyService';
import SyncedVideoPlayer from '../components/SyncedVideoPlayer';
import LiveChatPanel from '../components/LiveChatPanel';

const WatchPartyRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [currentUser, setCurrentUser] = useState<WatchPartyUser>({ id: 'guest', name: 'Guest' });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeRoom = async () => {
      if (!roomId) {
        navigate('/home');
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        const profileName = user?.email?.split('@')[0] ?? 'Guest';
        const watcher: WatchPartyUser = {
          id: user?.id ?? `guest-${Math.random().toString(36).slice(2, 8)}`,
          name: profileName,
        };
        setCurrentUser(watcher);
        const joinedRoom = await joinRoom(roomId, watcher, {
          mediaTitle: 'Nexora Watch Party',
          mediaPoster: '',
        });
        setRoom(joinedRoom);
      } catch (error) {
        console.error('Error initializing room:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    if (!room?.roomId) return;
    const unsubscribe = subscribeToRoom(room.roomId, (updatedRoom) => {
      setRoom(updatedRoom);
    });
    return unsubscribe;
  }, [room?.roomId]);

  useEffect(() => {
    return () => {
      if (roomId && currentUser.id) {
        leaveRoom(roomId, currentUser.id).catch((error) => {
          console.error('Error leaving room:', error);
        });
      }
    };
  }, [roomId, currentUser.id]);

  const copyLink = async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const joinedParticipants = useMemo(() => room?.participants ?? [], [room]);
  const host = room?.participants.find((participant) => participant.isHost);
  const isHost = currentUser.id === room?.hostId;

  if (loading || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050510] text-white p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-500" />
          <p className="text-gray-400">Joining watch party...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white selection:bg-indigo-500/30">
      <div className="relative mx-auto max-w-[1600px] px-4 py-8 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-300 font-black">Watch Party Room</p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-tighter">Room #{room.roomId.slice(0, 8)}</h1>
            <p className="mt-2 text-sm text-gray-300 max-w-2xl">{room.mediaTitle} · Host: {host?.name ?? 'Nexora'}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-indigo-400"
            >
              <Copy size={16} /> {copied ? 'Copied' : 'Copy Link'}
            </button>
            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
            >
              <Share2 size={16} /> Back to library
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <SyncedVideoPlayer room={room} isHost={isHost} />

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-300 font-black">Participants</p>
                  <h2 className="text-xl font-black uppercase tracking-tighter">{joinedParticipants.length} present</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-indigo-200">
                  <Users size={16} /> Live
                </div>
              </div>
              <div className="space-y-3">
                {joinedParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-3xl bg-indigo-500/15 flex items-center justify-center text-indigo-200 font-black uppercase">
                        {participant.name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-white">{participant.name}</p>
                        <p className="text-[11px] text-gray-500">{participant.isHost ? 'Host' : 'Viewer'}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300">
                      {participant.isHost ? 'Controller' : 'Watch only'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <LiveChatPanel room={room} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyRoomPage;

