# Multi-stage Dockerfile for backend (SpringBoot)
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# metadata
LABEL org.opencontainers.image.title="LuckyFlip-backend"
LABEL org.opencontainers.image.license="MIT"
LABEL org.opencontainers.image.source=""

# Create a non-root user to run the app
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=builder /app/target/*.jar /app/app.jar
RUN chown -R app:app /app

# Install a tiny HTTP client for the healthcheck (kept small and removed cache)
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Set safe default Java options (can be overridden via environment)
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xms128m -Djava.security.egd=file:/dev/./urandom"

USER app

EXPOSE 8080

# Basic healthcheck that hits root (adjust path if your app exposes /actuator/health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:8080/ || exit 1

ENTRYPOINT ["java","-jar","/app/app.jar"]
