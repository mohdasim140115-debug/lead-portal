import dns from "node:dns";

// Some ISP / local resolvers refuse SRV & TXT queries, which breaks
// `mongodb+srv://` connection strings (ECONNREFUSED on querySrv). When
// MONGODB_DNS_SERVERS is set (comma-separated IPs) we point Node's resolver at
// them just for this process.
let applied = false;

export function applyDnsOverride() {
  if (applied) return;
  applied = true;
  const raw = process.env.MONGODB_DNS_SERVERS;
  if (!raw) return;
  const servers = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length) {
    try {
      dns.setServers(servers);
      if (dns.promises?.setServers) dns.promises.setServers(servers);
    } catch {
      // Leave the system resolver in place if the override is invalid.
    }
  }
}
