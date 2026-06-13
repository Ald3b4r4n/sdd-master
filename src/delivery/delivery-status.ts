import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { DeliveryStatusSummary } from "./delivery-types.js";

export function getDeliveryStatus(cwd: string): DeliveryStatusSummary {
  const release = latestPlan(cwd, ".sdd-master/releases", "RELEASE-");
  const deploy = latestPlan(cwd, ".sdd-master/deliveries", "DEPLOY-");
  const deployContent = deploy.file ? readFileSync(join(cwd, ".sdd-master/deliveries", deploy.file), "utf8") : "";

  return {
    release: {
      latestPlan: release.file?.replace(".md", "") ?? "não iniciado",
      status: release.status,
      blockers: release.blockers
    },
    deploy: {
      latestPlan: deploy.file?.replace(".md", "") ?? "não iniciado",
      environment: extractSection(deployContent, "Ambiente") ?? "não detectado",
      status: deploy.status,
      blockers: deploy.blockers
    }
  };
}

function latestPlan(
  cwd: string,
  directory: string,
  prefix: string
): { file?: string; status: "not-started" | "blocked" | "ready" | "registered"; blockers: number } {
  const fullPath = join(cwd, directory);
  if (!existsSync(fullPath)) return { status: "not-started", blockers: 0 };

  const files = readdirSync(fullPath)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
    .sort();
  const file = files.at(-1);
  if (!file) return { status: "not-started", blockers: 0 };

  const content = readFileSync(join(fullPath, file), "utf8");
  return {
    file,
    status: content.includes("## Status\nBloqueado")
      ? "blocked"
      : content.includes("## Status\nPronto para autorização")
        ? "ready"
        : "registered",
    blockers: countBlockers(content)
  };
}

function countBlockers(content: string): number {
  const section = content.match(/## Bloqueios encontrados\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";
  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith("- ") && line.trim() !== "- Nenhum").length;
}

function extractSection(content: string, heading: string): string | undefined {
  return content.match(new RegExp(`## ${heading}\\n([^\\n]+)`))?.[1]?.trim();
}
