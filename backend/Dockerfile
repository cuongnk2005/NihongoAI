# --- Stage 1: Build JAR ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Run Application ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Dynamic port for cloud environments (Render, Koyeb, Railway)
ENV PORT=8088
EXPOSE 8088

ENTRYPOINT ["java", "-jar", "app.jar"]

