import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CheckSquare, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { BackendStatusBadge } from '../components/layout/BackendStatusBadge';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirection d'origine (si redirigé par ProtectedRoute)
  const from = (location.state as any)?.from?.pathname || '/tasks';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      if (response && response.token) {
        // Récupération de l'utilisateur fourni par le backend ou extrait du token
        let userToStore = response.user;
        if (!userToStore) {
          try {
            const tokenPayload = JSON.parse(atob(response.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            userToStore = {
              email: tokenPayload.sub || email.trim(),
              name: tokenPayload.name || email.trim().split('@')[0],
            };
          } catch {
            userToStore = { email: email.trim() };
          }
        }

        login(response.token, userToStore);
        toast.success('Connexion réussie !');
        navigate(from, { replace: true });
      } else {
        setServerError('Réponse invalide du serveur (aucun token reçu).');
      }
    } catch (err: any) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setServerError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Connexion à votre espace
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Gérez vos tâches efficacement et simplement
        </p>
        <div className="mt-3 flex justify-center">
          <BackendStatusBadge />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {/* RF-20: Alerte d'erreur dans le formulaire */}
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-700 font-medium leading-relaxed">
                {serverError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <Input
              id="email"
              type="email"
              label="Adresse email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
              disabled={isLoading}
            />

            {/* Mot de passe */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[35px] text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Masquer' : 'Afficher'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button (RF-22) */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-600">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
