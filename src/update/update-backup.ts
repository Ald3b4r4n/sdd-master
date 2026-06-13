import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveInsideProject } from "../filesystem/path-safety.js";
import { safeMkdir, safeWriteFile } from "../filesystem/safe-write.js";
import type { UpdatePlan } from "./update-types.js";

export function createUpdateBackup(cwd: string, plan: UpdatePlan, timestampSlug: string, timestamp: string): string | undefined {
  const files = filesToBackup(plan);

  if (files.length === 0) {
    return undefined;
  }

  const backupPath = `.sdd-master/backups/update-${timestampSlug}`;
  safeMkdir(cwd, `${backupPath}/files`);
  const copied: string[] = [];

  for (const file of files) {
    const source = resolveInsideProject(cwd, file);
    if (!existsSync(source)) {
      continue;
    }

    safeWriteFile(cwd, `${backupPath}/files/${file}`, readFileSync(source, "utf8"));
    copied.push(file);
  }

  safeWriteFile(
    cwd,
    `${backupPath}/manifest.md`,
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
`
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
