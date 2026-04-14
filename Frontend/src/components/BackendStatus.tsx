import React, { useEffect, useState } from 'react';
import { fetchBackendStatus } from '../api/backend';

const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchBackendStatus();
        setStatus(data);
      } catch (err) {
        setError('Could not connect to backend. Make sure the NestJS server is running at http://127.0.0.1:3001');
      }
    };

    checkStatus();
  }, []);

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900/80 text-white p-3 rounded-lg border border-red-500 text-sm shadow-xl z-50">
        ❌ {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900/80 text-white p-3 rounded-lg border border-gray-500 text-sm shadow-xl z-50">
        ⏳ Connecting to Backend...
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-900/80 text-white p-3 rounded-lg border border-green-500 text-sm shadow-xl z-50">
      ✅ {status.message}
    </div>
  );
};

export default BackendStatus;
