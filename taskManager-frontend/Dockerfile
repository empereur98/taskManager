# Étape 1 : Build de l'application React avec Vite
FROM node:20-alpine AS build

WORKDIR /app

# Arguments de build pour l'URL de l'API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copie des fichiers de dépendances
COPY package*.json .npmrc* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps


# Copie du code source et compilation
COPY . .
RUN npm run build

# Étape 2 : Serveur de production Nginx
FROM nginx:alpine

# Copie de la configuration personnalisée Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build statique depuis l'étape de compilation
COPY --from=build /app/dist /usr/share/nginx/html

# Vérification d'état (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
