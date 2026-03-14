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
- Optional dev helper: Python 3 (to run a lightweight static server for preview)

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

This starts the Spring Boot app (defaults: port 8080 unless configured otherwise in `application.yaml`).

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

If you run the backend locally and want the widget served from Spring Boot instead, copy (or build pipeline) the frontend files into `src/main/resources/static/` and Spring Boot will serve them automatically at `/widget.html`.

---

## 🔧 Development notes & conventions
- The backend code lives under `src/main/java`. Tests are under `src/test/java`.
- The static widget is intentionally self-contained to make it easy to preview without a build step.
- Inline SVG attributes in `frontend/widget.html` may trigger IDE warnings ("Obsolete attribute") in some editors; these warnings are benign for browser rendering. If you prefer, move SVG stroke/fill attributes into CSS to silence those warnings.

---

## ⚙️ React migration guidance (optional)
If you want to migrate the static widget to a modern React app, here is a suggested path:

1) Scaffold a Vite + React app inside the repo:

```cmd
cd %USERPROFILE%\LuckyFlip
npm create vite@latest frontend-react -- --template react
cd frontend-react
npm install
```

2) Dev server proxy to Spring Boot to avoid CORS headaches (edit `vite.config.js`):

```js
// snippet for vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

3) Convert the widget logic to React components:
- Card, Timer, Controls, ResultBanner → separate components
- Use React hooks (`useState`, `useEffect`) for state and the timer

4) Production: build (`npm run build`) and copy `dist/` to `src/main/resources/static/` or deploy separately (Netlify/Vercel/CDN).

Automation tip: add a Maven `frontend-maven-plugin` step to build the React app automatically during `mvn package`.

---

## 🔁 CI / Build ideas
- Add a simple GitHub Actions workflow that runs `mvn -B -DskipTests package` and `mvn test` on PRs.
- If you add a React app, extend the workflow to `npm install && npm run build` and validate the `dist/` artifacts.

---

## 🐞 Troubleshooting
- Backend doesn't start: ensure Java JDK is installed and `JAVA_HOME` is set to Java 11+.
- Port conflicts: check `application.yaml` or kill the process using port 8080.
- Widget not loading fonts/assets when opened via `file://`: run a local server (Python) or serve through Spring Boot.

---

## 📝 License & contributing
- Add a `LICENSE` file to choose a license (e.g., MIT) if you want this repo public.
- CONTRIBUTING guidelines: you can add a `CONTRIBUTING.md` for PR workflow, branch naming, and code style.

---

## ℹ️ Final notes
- This README now contains a full project overview and folder listing as requested.
- If you'd like I can also:
  - Add a `LICENSE` file (MIT) and update this README accordingly
  - Create a `frontend-react/` scaffold and wire a dev proxy and Maven build step
  - Clean inline SVG attributes in `frontend/widget.html` to silence IDE warnings

Tell me which of these you'd like next and I'll implement it.

---

Thanks — enjoy working on LuckyFlip! 🎉
