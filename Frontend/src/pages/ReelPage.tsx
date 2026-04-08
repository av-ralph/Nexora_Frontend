import { useState } from 'react';
import { type ReelItem, fetchInstagramReels } from '../api/reels';



const ReelPage = () => {
  const [username, setUsername] = useState('');
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchReels = async () => {
    if (!username.trim()) {
      setError('Enter a username first');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Pass as an object and extract the 'reels' array from the response
      const data = await fetchInstagramReels({ username: username.trim() });
      setReels(data.reels || []);
    } catch (err: any) {
      console.error('Fetch reels failed:', err);
      setError(err?.message || 'Reels fetch failed');
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white p-6 md:p-12">
      <h1 className="text-3xl md:text-5xl font-black mb-6">Watch Reel</h1>

      <div className="max-w-xl mb-8 space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Instagram username"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          onClick={handleFetchReels}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-white font-bold"
        >
          {loading ? 'Loading...' : 'Load Reels'}
        </button>

        {error && <p className="text-red-400">{error}</p>}
      </div>

      {reels.length === 0 && !error && !loading && (
        <p className="text-gray-300">No reels loaded yet. Enter username and click Load Reels.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reels.map((reel) => (
          <article key={reel.id} className="bg-white/10 rounded-xl p-4 border border-white/10">
            <h2 className="text-lg font-bold mb-2 line-clamp-1">{reel.caption || 'Instagram Reel'}</h2>
            {reel.thumbnail_url ? (
              <img src={reel.thumbnail_url} alt="reel thumbnail" className="w-full h-48 object-cover rounded-lg mb-2" />
            ) : null}
            <p className="text-sm text-gray-200 mb-2">{reel.timestamp ? `Posted on ${new Date(reel.timestamp * 1000).toLocaleDateString()}` : 'Date unknown'}</p>
            <a href={reel.video_url} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-100 underline">
              Open Reel
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ReelPage;
