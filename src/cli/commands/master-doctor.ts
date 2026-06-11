import { runDoctor } from "../../doctor/doctor.js";
import { formatDoctorJson, formatDoctorText } from "../../doctor/doctor-report.js";
import type { CliOutput, CliRuntime } from "../output.js";

export function runDoctorCommand(args: string[], output: CliOutput, runtime: CliRuntime): number {
  const json = args.includes("--json");
  const unknown = args.find((arg) => arg !== "--json");

  if (unknown) {
    output.stderr(`Opção desconhecida para doctor: ${unknown}\n`);
    return 1;
  }

  const report = runDoctor(runtime.cwd);
  output.stdout(json ? formatDoctorJson(report) : formatDoctorText(report));
  return 0;
}
