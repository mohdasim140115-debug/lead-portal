export default function sitemap() {
  const base = process.env.APP_URL || "http://localhost:3000";
  return [{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
