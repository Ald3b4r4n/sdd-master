import { existsSync } from "node:fs";
import { safeMkdir, safeWriteFile } from "../filesystem/safe-write.js";
import { resolveInsideProject } from "../filesystem/path-safety.js";
import { officialTemplates } from "./official-templates.js";

export type TemplateWriteResult = {
  created: number;
  existing: number;
  total: number;
};

export function writeOfficialTemplates(cwd: string): TemplateWriteResult {
  const templatesRoot = resolveInsideProject(cwd, ".sdd-master/templates");
  let created = 0;
  let existing = 0;

  safeMkdir(cwd, ".sdd-master/templates");

  for (const template of officialTemplates) {
    const relativePath = `.sdd-master/templates/${template.path}`;
    const targetPath = resolveInsideProject(cwd, relativePath);

    if (existsSync(targetPath)) {
      existing += 1;
      continue;
    }

    safeWriteFile(cwd, relativePath, template.content);
    created += 1;
  }

  return {
    created,
    existing,
    total: officialTemplates.length
  };
}
