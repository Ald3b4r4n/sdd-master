import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { UpdatePlan } from "./update-types.js";

export function createUpdateBackup(cwd: string, plan: UpdatePlan, timestampSlug: string, timestamp: string): string | undefined {
  const files = filesToBackup(plan);

  if (files.length === 0) {
    return undefined;
  }

  const backupPath = `.sdd-master/backups/update-${timestampSlug}`;
  const backupRoot = join(cwd, backupPath);
  mkdirSync(join(backupRoot, "files"), { recursive: true });
  const copied: string[] = [];

  for (const file of files) {
    const source = join(cwd, file);
    if (!existsSync(source)) {
      continue;
    }

    const target = join(backupRoot, "files", file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(source, "utf8"), "utf8");
    copied.push(file);
  }

  writeFileSync(
    join(backupRoot, "manifest.md"),
    `# Backup de Update — SDD Master

## Data
${timestamp}

## Versão anterior detectada
${plan.installedVersion}

## Versão alvo
${plan.targetVersion}

## Motivo
Backup automático antes de \`sdd master update --apply\`.

## Arquivos copiados
${copied.length > 0 ? copied.map((file) => `- ${file}`).join("\n") : "- Nenhum arquivo existente precisou ser copiado"}

## Observação
Este backup foi criado antes de qualquer alteração.
`,
    "utf8"
  );

  return backupPath;
}

function filesToBackup(plan: UpdatePlan): string[] {
  const files = plan.templateItems
    .filter((item) => item.action === "update")
    .map((item) => item.path);

  if (plan.projectStateItem?.action === "update") {
    files.push(plan.projectStateItem.path);
  }

  return files;
}
