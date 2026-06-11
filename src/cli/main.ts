#!/usr/bin/env node
import { getHelpText } from "../index.js";

declare const process: {
  argv: string[];
  stdout: { write(message: string): void };
  stderr: { write(message: string): void };
  exitCode?: number;
};

const args = process.argv.slice(2);

function printHelp(): void {
  process.stdout.write(getHelpText());
}

function printUnknownCommand(): void {
  process.stderr.write("Comando não reconhecido. Use: sdd --help\n");
}

function main(argv: string[]): number {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return 0;
  }

  if (argv[0] === "master" && (argv.length === 1 || argv[1] === "--help" || argv[1] === "help")) {
    printHelp();
    return 0;
  }

  printUnknownCommand();
  return 1;
}

process.exitCode = main(args);
