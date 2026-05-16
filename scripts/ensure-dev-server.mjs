#!/usr/bin/env node
/**
 * Stops a stale Next.js dev server for this project so `yarn dev` does not fail
 * with "Another next dev server is already running."
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const projectDir = process.cwd();
const logPath = join(projectDir, ".next/dev/logs/next-development.log");

function readPidFromLog() {
  if (!existsSync(logPath)) return null;
  try {
    const log = readFileSync(logPath, "utf8");
    const match = log.match(/PID:\s*(\d+)/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

function isOurNextProcess(pid) {
  try {
    const cmd = execSync(`ps -p ${pid} -o args= 2>/dev/null`, {
      encoding: "utf8",
    }).trim();
    return cmd.includes("next") && cmd.includes(projectDir);
  } catch {
    return false;
  }
}

function killPid(pid) {
  try {
    process.kill(pid, "SIGTERM");
    execSync(`sleep 0.5`);
    try {
      process.kill(pid, 0);
      process.kill(pid, "SIGKILL");
    } catch {
      /* already stopped */
    }
    console.log(`Stopped stale Next.js dev server (PID ${pid}).`);
  } catch {
    /* process already gone */
  }
}

const pid = readPidFromLog();
if (pid && isOurNextProcess(pid)) {
  killPid(pid);
}
