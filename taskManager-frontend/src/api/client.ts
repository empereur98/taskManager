import { toast } from 'sonner';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function checkBackendHealth(): Promise<boolean> {
  const cleanBase = API_BASE_URL.replace(/\/$/, '');
  
  // 1. Essai sur /actuator/health (léger, ultra-rapide) avec timeout 10s (tolérance cold-start)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${cleanBase}/actuator/health`, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return true;
  } catch {
    // Si /actuator/health échoue (ex: 404 ou timeout), on tente le fallback /v3/api-docs
  }

  // 2. Fallback sur /v3/api-docs
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${cleanBase}/v3/api-docs`, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    if (data && typeof data === 'object') {
      const errorData = data as Record<string, unknown>;
      if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object' && !Array.isArray(errorData.fieldErrors)) {
        this.fieldErrors = errorData.fieldErrors as Record<string, string>;
      } else if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
        this.fieldErrors = errorData.errors as Record<string, string>;
      }
    }
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  // Cible systématiquement le serveur backend réel sur http://localhost:8080
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  console.log(`📡 [Backend ${API_BASE_URL}] Envoi ${rest.method || 'GET'} -> ${url}`);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    // Cas spécifique 401 sur requête protégée (Non authentifié / token expiré) -> RF-21
    if (response.status === 401 && requiresAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      toast.error('Session expirée ou invalide. Veuillez vous reconnecter.');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
      throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401);
    }

    // Cas 204 No Content (ex: DELETE réussi) -> RF-13
    if (response.status === 204) {
      return {} as T;
    }

    // Tenter de parser la réponse JSON
    let responseData: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => null);
    }

    if (!response.ok) {
      let errorMessage = '';

      if (typeof responseData === 'object' && responseData !== null) {
        const errObj = responseData as Record<string, unknown>;
        if (typeof errObj.message === 'string') {
          errorMessage = errObj.message;
        } else if (typeof errObj.error === 'string') {
          errorMessage = errObj.error;
        } else if (errObj.fieldErrors && typeof errObj.fieldErrors === 'object') {
          errorMessage = Object.entries(errObj.fieldErrors as Record<string, unknown>)
            .map(([field, msg]) => `${field}: ${String(msg)}`)
            .join(', ');
        } else if (typeof errObj.detail === 'string') {
          errorMessage = errObj.detail;
        } else if (errObj.errors) {
          if (Array.isArray(errObj.errors)) {
            errorMessage = errObj.errors
              .map((e: unknown) => {
                if (typeof e === 'string') return e;
                if (e && typeof e === 'object') {
                  const entry = e as Record<string, unknown>;
                  if (typeof entry.defaultMessage === 'string') return entry.defaultMessage;
                  if (typeof entry.message === 'string') return entry.message;
                  return JSON.stringify(entry);
                }
                return String(e);
              })
              .join(', ');
          } else if (typeof errObj.errors === 'object') {
            errorMessage = Object.entries(errObj.errors as Record<string, unknown>)
              .map(([field, msg]) => `${field}: ${String(msg)}`)
              .join(', ');
          }
        }
      } else if (typeof responseData === 'string' && responseData.length > 0) {
        errorMessage = responseData;
      }

      // Messages d'erreurs lisibles selon le code HTTP si aucun message fourni par le backend
      if (!errorMessage) {
        switch (response.status) {
          case 400:
            errorMessage = 'Données invalides. Veuillez vérifier vos saisies.';
            break;
          case 401:
            errorMessage = 'Identifiants invalides ou session non autorisée.';
            break;
          case 403:
            errorMessage = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
            break;
          case 404:
            errorMessage = 'Ressource introuvable.';
            break;
          case 409:
            errorMessage = 'Un conflit est survenu (ex: email déjà utilisé).';
            break;
          case 500:
            errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = `Erreur HTTP ${response.status}`;
            break;
        }
      }

      console.warn(`⚠️ [Backend ${API_BASE_URL} Erreur ${response.status}] pour ${url}:`, responseData);
      throw new ApiError(errorMessage, response.status, responseData);
    }

    console.log(`📥 [Backend ${API_BASE_URL} Succès ${response.status}] pour ${url}:`, responseData);
    return responseData as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const errorMsg = error instanceof Error ? error.message : undefined;
    console.error('❌ [Backend Injoignable]', {
      targetUrl: url,
      error,
      message: errorMsg,
    });

    // Erreur réseau (ex: serveur injoignable, backend éteint, ou CORS)
    const networkMsg = `Impossible de contacter le serveur (${url}). Vérifiez votre connexion ou que le backend est démarré.`;
    toast.error(networkMsg);
    throw new ApiError(networkMsg, 0);
  }
}
