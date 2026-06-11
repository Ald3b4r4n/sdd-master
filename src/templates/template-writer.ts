import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { officialTemplates } from "./official-templates.js";

export type TemplateWriteResult = {
  created: number;
  existing: number;
  total: number;
};

export function writeOfficialTemplates(cwd: string): TemplateWriteResult {
  const templatesRoot = join(cwd, ".sdd-master", "templates");
  let created = 0;
  let existing = 0;

  mkdirSync(templatesRoot, { recursive: true });

  for (const template of officialTemplates) {
    const targetPath = join(templatesRoot, template.path);
    mkdirSync(dirname(targetPath), { recursive: true });

    if (existsSync(targetPath)) {
      existing += 1;
      continue;
    }

    writeFileSync(targetPath, template.content, "utf8");
    created += 1;
  }

  return {
    created,
    existing,
    total: officialTemplates.length
  };
}
