import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CheckSquare, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { BackendStatusBadge } from '../components/layout/BackendStatusBadge';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });

      // En cas de succès, un toast de confirmation s'affiche et l'utilisateur est redirigé vers la page de connexion
      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err: any) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setServerError(err.message || 'Une erreur est survenue lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Rejoignez Task Manager pour organiser vos projets
        </p>
        <div className="mt-3 flex justify-center">
          <BackendStatusBadge />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-700 font-medium leading-relaxed">
                {serverError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nom (optionnel mais supporté selon 5.1) */}
            <Input
              id="name"
              label="Nom complet (optionnel)"
              placeholder="Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />

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
                autoComplete="new-password"
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

            {/* Confirmation du mot de passe */}
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              label="Confirmer le mot de passe"
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            {/* Bouton de soumission (RF-22) */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              S'inscrire
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-600">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
