import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { version } from "../index.js";
import { officialTemplates, templateVersion } from "../templates/official-templates.js";
import type { UpdateConflict, UpdateOptions, UpdatePlan, UpdatePlanItem } from "./update-types.js";
import { getProjectStateUpdate } from "./update-project-state.js";

export function createUpdatePlan(cwd: string, options: UpdateOptions, timestamp: string): UpdatePlan {
  const projectState = getProjectStateUpdate(cwd, timestamp);
  const templateItems = options.templates ? planTemplates(cwd, options.force) : [];
  const projectStateItem: UpdatePlanItem | undefined =
    options.projectState && projectState.needsUpdate
      ? {
          path: ".sdd-master/project-state.md",
          action: "update",
          reason: "missing or stale SDD Master version metadata",
          content: projectState.content
        }
      : options.projectState
        ? {
            path: ".sdd-master/project-state.md",
            action: "preserve",
            reason: "version metadata already present"
          }
        : undefined;
  const conflicts: UpdateConflict[] = templateItems
    .filter((item) => item.action === "conflict")
    .map((item) => ({
      path: item.path,
      reason: item.reason,
      action: "preserved"
    }));

  return {
    installedVersion: projectState.installedVersion,
    targetVersion: version,
    installedTemplateVersion: projectState.templateVersion,
    targetTemplateVersion: templateVersion,
    templateItems,
    projectStateItem,
    conflicts
  };
}

function planTemplates(cwd: string, force: boolean): UpdatePlanItem[] {
  return officialTemplates.map((template) => {
    const path = `.sdd-master/templates/${template.path}`;
    const fullPath = join(cwd, path);

    if (!existsSync(fullPath)) {
      return {
        path,
        action: "create",
        reason: "template missing",
        content: template.content
      };
    }

    const existing = readFileSync(fullPath, "utf8");

    if (normalize(existing) === normalize(template.content)) {
      return {
        path,
        action: "preserve",
        reason: "template already current"
      };
    }

    if (existing.includes("Managed by: SDD Master")) {
      return {
        path,
        action: "update",
        reason: force ? "managed template update requested with force" : "managed template can be updated safely",
        content: template.content
      };
    }

    return {
      path,
      action: "conflict",
      reason: "local modification detected"
    };
  });
}

function normalize(content: string): string {
  return content.replace(/\r\n/g, "\n").trim();
}
