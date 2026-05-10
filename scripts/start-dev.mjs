import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, "frontend");
const venvPython = path.join(rootDir, ".venv", "bin", "python");
const pythonCommand = existsSync(venvPython) ? venvPython : "python3";
const frontendUrl = "http://localhost:5173";

const children = [];

function isPortOpen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (signal || code === 0) return;
    console.error(`${name} exited with code ${code}`);
    shutdown();
  });

  return child;
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

if (!(await isPortOpen(8000))) {
  console.error("Port 8000 is already in use. Stop the old backend, then run npm start again.");
  console.error("Try: lsof -nP -iTCP:8000 -sTCP:LISTEN");
  process.exit(1);
}

run("backend", pythonCommand, ["-m", "uvicorn", "api.main:app", "--reload"]);
run("frontend", "npm", ["run", "dev"], { cwd: frontendDir });

setTimeout(() => {
  const opener = process.platform === "darwin" ? "open" : "xdg-open";
  const browser = spawn(opener, [frontendUrl], {
    stdio: "ignore",
    detached: true,
  });
  browser.unref();
}, 2500);
