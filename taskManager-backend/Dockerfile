# Étape 1 : Build de l'application avec Eclipse Temurin JDK 21
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /app

# Copie des fichiers Maven wrapper et descripteurs
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copie du code source et compilation
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Étape 2 : Image d'exécution JRE 21 avec utilisateur non-root
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Création d'un groupe et utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copie du JAR produit depuis l'étape de compilation
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
