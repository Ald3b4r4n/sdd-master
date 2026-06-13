export type SupportedPlatform = "windows" | "linux" | "macos" | "other";

export function getPlatform(): SupportedPlatform {
  if (process.platform === "win32") return "windows";
  if (process.platform === "linux") return "linux";
  if (process.platform === "darwin") return "macos";
  return "other";
}

export function isCaseInsensitivePlatform(): boolean {
  return process.platform === "win32" || process.platform === "darwin";
}
