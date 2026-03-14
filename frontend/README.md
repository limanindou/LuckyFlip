Lucky Flip — Frontend

This folder contains a Vite + React frontend for the Lucky Flip game. It expects the backend to be running on http://localhost:8080 and proxies /api to that URL during development.

Quick start (Windows, cmd.exe)

1) Install dependencies

```
cd C:\Users\ndoul\Documents\VibeCoding\LuckyFlip\backend\frontend
npm install
```

2) Start the backend (in a separate terminal) — from the backend folder:

```
cd C:\Users\ndoul\Documents\VibeCoding\LuckyFlip\backend
mvnw.cmd spring-boot:run
```

3) Run the frontend dev server

```
cd C:\Users\ndoul\Documents\VibeCoding\LuckyFlip\backend\frontend
npm run dev
```

The Vite dev server runs on http://localhost:3000 by default and proxies API requests whose path begins with /api to http://localhost:8080.

Build for production

```
cd C:\Users\ndoul\Documents\VibeCoding\LuckyFlip\backend\frontend
npm run build
```

Troubleshooting

- If `npm install` or `npm run build` fails, check your Node.js version (Node 16+ recommended). If you're behind a proxy or have restricted network access, install dependencies manually or use an offline mirror.
- If the frontend cannot reach the backend, ensure the backend is running on port 8080 and CORS is allowed. The backend controller has `@CrossOrigin(origins = "*")` so it should accept requests from the frontend dev server.

Files of interest

- `src/App.jsx` — main React UI and game logic (calls `/api/game/start` and `/api/game/{id}/guess`).
- `vite.config.js` — dev server proxy that forwards `/api` to `http://localhost:8080`.

If you'd like, I can:
- Add scripts to the repository root to run both servers concurrently.
- Improve UI interactivity (animations, icons, responsive behavior).
- Add E2E or integration tests for the frontend.

