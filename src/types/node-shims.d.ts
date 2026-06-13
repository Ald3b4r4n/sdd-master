declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function statSync(path: string): {
    isDirectory(): boolean;
  };
  export function lstatSync(path: string): {
    isSymbolicLink(): boolean;
  };
  export function realpathSync(path: string): string;
  export function writeFileSync(path: string, data: string, encoding?: "utf8"): void;
  export function appendFileSync(path: string, data: string, encoding?: "utf8"): void;
}

declare module "node:path" {
  export function basename(path: string): string;
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function isAbsolute(path: string): boolean;
  export const sep: string;
}

declare const process: {
  platform: string;
};

declare module "node:readline/promises" {
  export function createInterface(options: {
    input: unknown;
    output: unknown;
  }): {
    question(query: string): Promise<string>;
    close(): void;
  };
}

declare module "node:child_process" {
  export function execFileSync(
    file: string,
    args: string[],
    options?: {
      cwd?: string;
      encoding?: "utf8";
      stdio?: ["ignore", "pipe", "ignore" | "pipe"];
    }
  ): string;
}
