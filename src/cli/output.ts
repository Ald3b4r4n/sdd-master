export type WritableStream = {
  write(message: string): void;
};

export type CliOutput = {
  stdout(message: string): void;
  stderr(message: string): void;
};

export type CliRuntime = {
  cwd: string;
  stdin?: unknown;
  stdoutStream?: unknown;
};

export function createConsoleOutput(stdout: WritableStream, stderr: WritableStream): CliOutput {
  return {
    stdout(message: string): void {
      stdout.write(message);
    },
    stderr(message: string): void {
      stderr.write(message);
    }
  };
}
