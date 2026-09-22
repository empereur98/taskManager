import React, { useEffect, useState } from 'react';
import { checkBackendHealth, API_BASE_URL } from '../../api/client';
import { Server, WifiOff, Loader2 } from 'lucide-react';

export const BackendStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      const ok = await checkBackendHealth();
      if (isMounted) setIsOnline(ok);
    };

    verify();
    const interval = setInterval(verify, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBackendHost = () => {
    try {
      const url = new URL(API_BASE_URL);
      return url.host;
    } catch {
      return API_BASE_URL;
    }
  };

  const host = getBackendHost();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
        isOnline === true
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
          : isOnline === false
          ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
          : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}
      title={`Statut de connexion avec ${API_BASE_URL}`}
    >
      <Server className="w-3.5 h-3.5 shrink-0" />
      {isOnline === true ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate">Backend connecté ({host})</span>
        </>
      ) : isOnline === false ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-rose-500" />
          <span className="truncate">Backend en veille / injoignable ({host})</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          <span>Connexion à {host}...</span>
        </>
      )}
    </div>
  );
};
