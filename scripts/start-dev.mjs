import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import process from "node:process";

// Project folder paths used to start the backend and frontend from one command.
const rootDir = process.cwd();
const frontendDir = path.join(rootDir, "frontend");

// Use the virtual environment Python if it exists; otherwise fall back to python3.
const venvPython = path.join(rootDir, ".venv", "bin", "python");
const pythonCommand = existsSync(venvPython) ? venvPython : "python3";

// Frontend URL opened automatically after the dev servers start.
const frontendUrl = "http://localhost:5173";

// Stores child processes so they can be stopped together.
const children = [];

function isPortOpen(port) {
  // Try to listen on a port. If it works, the port is available.
  return new Promise((resolve) => {
    const server = net.createServer();

    // Error means another process is already using the port.
    server.once("error", () => resolve(false));

    // Listening means the port is free, so close it right away.
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function run(name, command, args, options = {}) {
  // Start a command as a child process and show its output in the terminal.
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  children.push(child);

  // If one process fails, stop everything so the app is not half-running.
  child.on("exit", (code, signal) => {
    if (signal || code === 0) return;
    console.error(`${name} exited with code ${code}`);
    shutdown();
  });

  return child;
}

function shutdown() {
  // Stop all child processes started by this script.
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  // Stop backend/frontend when the user presses CTRL+C.
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  // Stop backend/frontend if the terminal sends a termination signal.
  shutdown();
  process.exit(0);
});

if (!(await isPortOpen(8000))) {
  // Backend needs port 8000. If it is busy, ask the user to stop the old server.
  console.error("Port 8000 is already in use. Stop the old backend, then run npm start again.");
  console.error("Try: lsof -nP -iTCP:8000 -sTCP:LISTEN");
  process.exit(1);
}

// Start FastAPI backend.
run("backend", pythonCommand, ["-m", "uvicorn", "api.main:app", "--reload"]);

// Start Vite frontend from the frontend folder.
run("frontend", "npm", ["run", "dev"], { cwd: frontendDir });

setTimeout(() => {
  // Open the frontend in the default browser after the servers have time to start.
  const opener = process.platform === "darwin" ? "open" : "xdg-open";
  const browser = spawn(opener, [frontendUrl], {
    stdio: "ignore",
    detached: true,
  });
  browser.unref();
}, 2500);
