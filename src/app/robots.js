export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/buyer", "/api", "/login"] }],
    sitemap: `${process.env.APP_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}
