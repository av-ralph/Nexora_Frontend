import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Play, Pause, RotateCcw, Share2 } from 'lucide-react';
import { sendPlaybackEvent, subscribeToRoom, type WatchPartyRoom } from '../services/watchPartyService';

interface SyncedVideoPlayerProps {
  room: WatchPartyRoom;
  isHost: boolean;
}

const SAMPLE_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const SyncedVideoPlayer = ({ room, isHost }: SyncedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playbackState, setPlaybackState] = useState(room.playback.state);
  const [position, setPosition] = useState(room.playback.position);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(room.roomId, (updatedRoom) => {
      const playback = updatedRoom.playback;
      setPlaybackState(playback.state);
      setPosition(playback.position);
      const video = videoRef.current;
      if (!video || isHost) return;

      if (Math.abs(video.currentTime - playback.position) > 0.5) {
        video.currentTime = playback.position;
      }

      if (playback.state === 'playing') {
        video.play().catch(() => null);
      } else {
        video.pause();
      }
    });

    return unsubscribe;
  }, [room.roomId, isHost]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      if (Math.abs(video.currentTime - room.playback.position) > 0.5) {
        video.currentTime = room.playback.position;
      }
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [room.playback.position]);

  const pushPlayback = async (state: 'playing' | 'paused', seek?: number) => {
    const nextPosition = seek ?? videoRef.current?.currentTime ?? position;
    try {
      await sendPlaybackEvent(room.roomId, { state, position: nextPosition });
      setPlaybackState(state);
      setPosition(nextPosition);
    } catch (error) {
      console.error('Error updating playback:', error);
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = next;
    }
    pushPlayback(playbackState, next);
  };

  const timeLabel = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden">
      <div className="relative overflow-hidden">
        <video
          ref={videoRef}
          src={room.mediaPoster ? SAMPLE_VIDEO : SAMPLE_VIDEO}
          poster={room.mediaPoster}
          className="w-full h-[360px] min-h-[200px] bg-black object-cover"
          controls={false}
          onTimeUpdate={() => {
            if (!isHost || !videoRef.current) return;
            setPosition(videoRef.current.currentTime);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-white">
          <div>
            <p className="font-black uppercase tracking-[0.2em]">{room.mediaTitle}</p>
            <p className="text-[11px] text-gray-300">{room.participants.length} participants now</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-gray-200">
            <Share2 size={14} /> Live synced
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => pushPlayback(playbackState === 'playing' ? 'paused' : 'playing')}
              disabled={!isHost}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all ${isHost ? 'bg-indigo-500 text-black hover:bg-indigo-400' : 'bg-white/5 text-gray-300 cursor-not-allowed opacity-60'}`}
            >
              {playbackState === 'playing' ? <Pause size={16} /> : <Play size={16} />} {isHost ? (playbackState === 'playing' ? 'Pause' : 'Play') : 'Host controls'}
            </button>
            <button
              type="button"
              onClick={() => pushPlayback('paused', 0)}
              disabled={!isHost}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-300 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p>{timeLabel(position)} / 03:14</p>
            <p className="text-[11px] text-gray-500">Host: {room.hostName}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Sync timeline</label>
          <input
            type="range"
            min={0}
            max={194}
            step={1}
            value={Math.round(position)}
            onChange={handleSeek}
            disabled={!isHost}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="rounded-[1.75rem] bg-black/20 p-4 text-sm text-gray-300">
          {isHost
            ? 'As the host, your controls update the room instantly for everyone joined.'
            : 'You are watching a synced playback session. Host controls are handled remotely.'}
        </div>
      </div>
    </div>
  );
};

export default SyncedVideoPlayer;
