declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function writeFileSync(path: string, data: string, encoding?: "utf8"): void;
  export function appendFileSync(path: string, data: string, encoding?: "utf8"): void;
}

declare module "node:path" {
  export function basename(path: string): string;
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
}

declare module "node:readline/promises" {
  export function createInterface(options: {
    input: unknown;
    output: unknown;
  }): {
    question(query: string): Promise<string>;
    close(): void;
  };
}
