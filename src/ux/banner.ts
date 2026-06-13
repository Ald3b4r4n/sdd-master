declare const process: {
  env?: Record<string, string | undefined>;
};

const bannerText = `SDD MASTER

███████╗██████╗ ██████╗     ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗
██╔════╝██╔══██╗██╔══██╗    ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
███████╗██║  ██║██║  ██║    ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝
╚════██║██║  ██║██║  ██║    ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗
███████║██████╔╝██████╔╝    ██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║
╚══════╝╚═════╝ ╚═════╝     ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝

Spec-Driven Development Framework
Governance • Tests • Security • Multi-AI • Delivery

Idealizado e desenvolvido por Antonio Rafael Souza Cruz de Noronha
AR Software Development
https://www.antoniorafael.com.br/
https://www.arsoftwaredevelopment.com.br/`;

export function stripBannerFlags(args: string[]): string[] {
  return args.filter((arg) => arg !== "--no-banner" && arg !== "--plain");
}

export function shouldShowBanner(args: string[]): boolean {
  const env = process.env ?? {};
  if (args.includes("--no-banner") || args.includes("--plain") || args.includes("--json")) return false;
  if (env.SDD_MASTER_NO_BANNER === "1" || env.NO_COLOR === "1" || env.CI === "1") return false;
  return true;
}

export function withBanner(content: string, args: string[]): string {
  return shouldShowBanner(args) ? `${bannerText}\n\n${content}` : content;
}
