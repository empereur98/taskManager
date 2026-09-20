import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from '../../api/client';
import { Server, WifiOff } from 'lucide-react';

export const BackendStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      const ok = await checkBackendHealth();
      if (isMounted) setIsOnline(ok);
    };

    verify();
    const interval = setInterval(verify, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
        isOnline === true
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
          : isOnline === false
          ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
          : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}
      title="Statut de la connexion avec le serveur Spring Boot"
    >
      <Server className="w-3.5 h-3.5 shrink-0" />
      {isOnline === true ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate">Backend en direct : http://localhost:8080</span>
        </>
      ) : isOnline === false ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-rose-500" />
          <span className="truncate">Backend injoignable (localhost:8080)</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-slate-300 animate-ping" />
          <span>Vérification backend...</span>
        </>
      )}
    </div>
  );
};
