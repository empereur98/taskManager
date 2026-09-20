import { toast } from 'sonner';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/v3/api-docs`, { method: 'GET', mode: 'cors' });
    return res.ok;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  data: any;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    if (data && typeof data === 'object') {
      if (data.fieldErrors && typeof data.fieldErrors === 'object') {
        this.fieldErrors = data.fieldErrors;
      } else if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        this.fieldErrors = data.errors;
      }
    }
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T = any>(
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

  console.log(`📡 [Backend http://localhost:8080] Envoi ${rest.method || 'GET'} -> ${url}`);

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
    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => null);
    }

    if (!response.ok) {
      let errorMessage = '';

      if (typeof responseData === 'object' && responseData !== null) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.fieldErrors && typeof responseData.fieldErrors === 'object') {
          errorMessage = Object.entries(responseData.fieldErrors).map(([field, msg]) => `${field}: ${msg}`).join(', ');
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.errors) {
          if (Array.isArray(responseData.errors)) {
            errorMessage = responseData.errors.map((e: any) => (typeof e === 'string' ? e : e.defaultMessage || e.message || JSON.stringify(e))).join(', ');
          } else if (typeof responseData.errors === 'object') {
            errorMessage = Object.entries(responseData.errors).map(([field, msg]) => `${field}: ${msg}`).join(', ');
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

      console.warn(`⚠️ [Backend http://localhost:8080 Erreur ${response.status}] pour ${url}:`, responseData);
      throw new ApiError(errorMessage, response.status, responseData);
    }

    console.log(`📥 [Backend http://localhost:8080 Succès ${response.status}] pour ${url}:`, responseData);
    return responseData as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('❌ [Backend Injoignable]', {
      targetUrl: url,
      error,
      message: error?.message,
    });

    // Erreur réseau (ex: serveur injoignable, backend éteint, ou CORS)
    const networkMsg = `Impossible de contacter le serveur (${url}). Vérifiez votre connexion ou que le backend est démarré.`;
    toast.error(networkMsg);
    throw new ApiError(networkMsg, 0);
  }
}
