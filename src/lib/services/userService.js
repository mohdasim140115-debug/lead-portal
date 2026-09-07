import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { ApiError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import { recordAudit } from "@/lib/services/auditService";

export async function listStaff({ page = 1, pageSize = 25, q } = {}) {
  await connectDB();
  const filter = { role: { $ne: "buyer" } };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    User.countDocuments(filter),
  ]);
  return {
    items: items.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createStaff(data, actor) {
  await connectDB();
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const user = await User.create({
    name: data.name,
    email: data.email,
    role: data.role,
    passwordHash: await hashPassword(data.password),
  });

  await recordAudit({
    actor,
    action: "user.create",
    entityType: "User",
    entityId: user._id,
    after: { name: user.name, email: user.email, role: user.role },
  });
  return user.toSafeJSON();
}

export async function updateStaff(id, data, actor) {
  await connectDB();
  const user = await User.findById(id);
  if (!user || user.role === "buyer") throw new ApiError(404, "User not found");

  if (actor?.id === id && data.status === "disabled") {
    throw new ApiError(400, "You cannot disable your own account");
  }
  if (actor?.id === id && data.role && data.role !== user.role) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const before = { name: user.name, role: user.role, status: user.status };

  if (data.name !== undefined) user.name = data.name;
  if (data.role !== undefined) user.role = data.role;
  if (data.status !== undefined) user.status = data.status;
  if (data.password) {
    user.passwordHash = await hashPassword(data.password);
    user.tokenVersion += 1; // force re-login everywhere
  }
  if (data.status === "disabled") user.tokenVersion += 1;

  await user.save();
  await recordAudit({
    actor,
    action: "user.update",
    entityType: "User",
    entityId: user._id,
    before,
    after: { name: user.name, role: user.role, status: user.status },
  });
  return user.toSafeJSON();
}
