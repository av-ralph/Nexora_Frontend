import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, History, User, Film } from "lucide-react";
import { getAdminWatchHistory } from "../../api/admin";

interface WatchHistoryItem {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string | null;
  movie_poster: string | null;
  media_type: string;
  watched_at: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function AdminWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getAdminWatchHistory(page, limit);
      setHistory(data.history);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch watch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watch History</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Movie/Show
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Watched
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No watch history found
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {item.movie_poster ? (
                          <img
                            src={item.movie_poster}
                            alt={item.movie_title || ""}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <Film className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <a
                            href={`/${item.media_type}/${item.movie_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-500"
                          >
                            {item.movie_title || `ID: ${item.movie_id}`}
                          </a>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {item.movie_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.user?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {item.media_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.watched_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
