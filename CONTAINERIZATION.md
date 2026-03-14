This project has been containerized with Dockerfiles for backend and frontend and a docker-compose.yml to run both together.

Quick commands (Windows cmd.exe):

1) Build and run locally with Docker Compose
   cd C:\Users\ndoul\Documents\VibeCoding\LuckyFlip
   docker compose up --build

2) Build only backend image
   cd backend
   docker build -t luckyflip-backend .

3) Build only frontend image
   cd frontend
   docker build -t luckyflip-frontend .

Notes & security considerations:
- Backend Dockerfile uses a multi-stage Maven build and runs the final jar as a non-root user.
- Frontend is built with Node and served via nginx (alpine) for small attack surface.
- In a DevSecOps pipeline you should add image scanning (Trivy/Grype), dependency scanning (Snyk/OWASP dependency-check), and container runtime policies (e.g., Pod Security, seccomp) in CI/CD.
- Consider using a distroless or reduced base image and pin image digests in production.
# Multi-stage Dockerfile for LuckyFlip backend (Spring Boot, Java 17)
# Stage 1: build with Maven
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /workspace
# copy only what is needed to leverage layer caching
COPY pom.xml ./
COPY src ./src

# Build the application (skip tests in image build for speed; run tests locally or in CI)
RUN mvn -B -DskipTests package

# Stage 2: runtime image
FROM eclipse-temurin:17-jre-jammy

# Create a non-root user to run the app
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=builder /workspace/target/*.jar /app/app.jar
RUN chown -R app:app /app
USER app

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

