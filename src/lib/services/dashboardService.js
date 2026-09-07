import { connectDB } from "@/lib/db/mongoose";
import Lead from "@/lib/db/models/Lead";
import { LEAD_STATUS } from "@/lib/constants";

// Single-pass aggregation for the admin dashboard headline numbers.
export async function getLeadStats() {
  await connectDB();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [row] = await Lead.aggregate([
    { $match: { archivedAt: null } },
    {
      $facet: {
        total: [{ $count: "n" }],
        today: [{ $match: { createdAt: { $gte: startOfToday } } }, { $count: "n" }],
        byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
        bySource: [{ $group: { _id: "$source", n: { $sum: 1 } } }],
      },
    },
  ]);

  const statusMap = Object.fromEntries((row?.byStatus || []).map((s) => [s._id, s.n]));
  const total = row?.total?.[0]?.n || 0;
  const purchased = statusMap[LEAD_STATUS.PURCHASED] || 0;
  const converted = statusMap[LEAD_STATUS.CONVERTED] || 0;

  return {
    total,
    today: row?.today?.[0]?.n || 0,
    new: statusMap[LEAD_STATUS.NEW] || 0,
    verified: statusMap[LEAD_STATUS.VERIFIED] || 0,
    available: statusMap[LEAD_STATUS.AVAILABLE] || 0,
    duplicate: statusMap[LEAD_STATUS.DUPLICATE] || 0,
    sold: purchased,
    conversionRate: purchased ? Math.round((converted / purchased) * 100) : 0,
    bySource: (row?.bySource || [])
      .map((s) => ({ source: s._id, count: s.n }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getRecentLeads(limit = 8) {
  await connectDB();
  const rows = await Lead.find({ archivedAt: null })
    .select("name city category source status quality createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return rows.map((l) => ({
    id: l._id.toString(),
    name: l.name || "Unnamed lead",
    city: l.city || null,
    category: l.category || null,
    source: l.source,
    status: l.status,
    quality: l.quality,
    createdAt: l.createdAt,
  }));
}
