import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Task Manager
            </h1>
            <span className="text-[11px] font-medium text-slate-500">
              Workspace personnel
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          {user?.email && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <UserIcon className="w-3 h-3" />
              </div>
              <span className="max-w-[160px] truncate">{user.email}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
