// Runs once when the Next.js server process starts (Node runtime only).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { applyDnsOverride } = await import("@/lib/db/dnsBootstrap");
    applyDnsOverride();
  }
}
