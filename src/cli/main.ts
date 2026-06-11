#!/usr/bin/env node
import { createConsoleOutput } from "./output.js";
import { runCommand } from "./command-registry.js";

declare const process: {
  argv: string[];
  cwd(): string;
  stdin: unknown;
  stdout: { write(message: string): void };
  stderr: { write(message: string): void };
  exitCode?: number;
};

const args = process.argv.slice(2);
const output = createConsoleOutput(process.stdout, process.stderr);

runCommand(args, output, {
  cwd: process.cwd(),
  stdin: process.stdin,
  stdoutStream: process.stdout
}).then((exitCode) => {
  process.exitCode = exitCode;
});
