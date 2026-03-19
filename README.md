# 🎲 LuckyFlip

A compact demo game: a Java Spring Boot backend with a small static frontend widget that implements a "higher / lower / draw" card flip game. This repository is designed as a simple example you can run locally for development, testing, or to evolve into a full React frontend later.

> Note: this README includes a project overview and folder structure as requested.

---

## 🚀 At a glance
- Backend: Spring Boot (Java)
- Build: Maven (mvnw wrapper included)
- Frontend: simple static HTML/CSS/JavaScript widget (located in `frontend/`)
- Purpose: demo game logic, simple UI, and a place to try integration with a React frontend if desired

---

## 🧩 Tech stack
- Java 11+ (or matching JDK)
- Spring Boot (REST API and serving static content)
- Maven (build, test, package) — `mvnw` / `mvnw.cmd` included
- Frontend: static HTML/CSS/JS widget (no framework) in `frontend/`

---

## 📁 Project structure (overview)
This is a concise listing of the main files and folders in this repo (intentionally comprehensive per your request):

- `pom.xml` — Maven project file
- `mvnw`, `mvnw.cmd` — Maven wrapper scripts
- `src/main/java/com/limani/LuckyFlip/` — main Java sources
  - `LuckyFlipApplication.java` — Spring Boot entry point
  - `controller/` — REST controllers (e.g., `GameController.java`)
  - `service/` — business logic (e.g., `GameService.java`)
  - `repository/` — data persistence stubs or repositories (e.g., `GameSessionRepository.java`)
  - `model/` — model classes (e.g., `GameSession.java`)
  - `dto/` — data transfer objects (e.g., `GameStartResponse.java`, `GuessResponse.java`)
  - `util/` — small utilities (e.g., `CardUtil.java`)
  - `enums/` — enumerations (e.g., `GameStatus.java`, `GuessType.java`)
- `src/main/resources/` — application resources
  - `application.yaml` — Spring Boot configuration
  - `static/` — (optional) static frontend assets served by Spring Boot
  - `templates/` — server-side templates if used
- `src/test/java/...` — unit and integration tests
- `frontend/` — static frontend files (widget)
  - `widget.html` — widget UI, JS and CSS in one file (for quick preview)
- `README.md` — this file
- `HELP.md` — project notes/help

Note: This listing is a flattened overview. Some generated/target files may exist when you build (e.g., `target/`).

---

## 💻 Quick start (Windows - cmd.exe)
Open a terminal (cmd.exe) and run the commands below from your project root.

1) Run the backend using the included Maven wrapper (dev mode):

```cmd
cd %USERPROFILE%\LuckyFlip
mvnw.cmd spring-boot:run
```

This starts the Spring Boot app (defaults: port 8080).

2) Build and run the packaged JAR:

```cmd
cd %USERPROFILE%\LuckyFlip
mvnw.cmd -DskipTests package
java -jar target\*.jar
```

3) Run the test suite:

```cmd
cd %USERPROFILE%\LuckyFlip
mvnw.cmd test
```

Mac / Linux equivalents (bash):

```bash
cd ~/LuckyFlip
./mvnw spring-boot:run
# or
./mvnw -DskipTests package
java -jar target/*.jar
```

---

## 🖥️ Preview the frontend widget (static)
The quick frontend preview uses the static `frontend/widget.html`. To preview locally with a lightweight static server (Python):

```cmd
cd %USERPROFILE%\LuckyFlip\frontend
python -m http.server 8000
```

Then open `http://localhost:8000/widget.html` in your browser.


---

Thanks — enjoy working on LuckyFlip! 🎉
