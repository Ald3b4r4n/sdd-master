export const knownCommands = [
  "help", "version", "status", "init", "onboard", "doctor", "agents", "git", "security",
  "skills", "plugins", "uiux", "update", "discovery", "requirements", "clarify", "approve",
  "scope", "backlog", "spec", "plan", "tasks", "quality", "audit", "docs", "blocker",
  "implement", "release", "deploy"
] as const;

export function suggestCommand(input: string): string | undefined {
  const ranked = knownCommands
    .map((command) => ({ command, distance: levenshtein(input.toLowerCase(), command) }))
    .sort((left, right) => left.distance - right.distance);
  return ranked[0] && ranked[0].distance <= 3 ? ranked[0].command : undefined;
}

function levenshtein(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previous = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const current = row[rightIndex];
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        previous + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
      previous = current;
    }
  }
  return row[right.length];
}
