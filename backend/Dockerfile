# Stage 1: Build the jar
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jdk
WORKDIR /app

# metadata
LABEL org.opencontainers.image.title="LuckyFlip-backend"
LABEL org.opencontainers.image.license="MIT"
LABEL org.opencontainers.image.source=""

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app \
    && chown -R app:app /app

# Install tiny HTTP client for healthcheck
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Set safe Java options
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xms128m -Djava.security.egd=file:/dev/./urandom"

# Use non-root user
USER app

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:8080/ || exit 1

# Run Spring Boot app
ENTRYPOINT ["java","-jar","app.jar"]