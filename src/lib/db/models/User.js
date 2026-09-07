import mongoose from "mongoose";
import { ALL_ROLES, ROLES } from "@/lib/constants";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // bcrypt hash — never selected by default.
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ALL_ROLES,
      required: true,
      default: ROLES.LEAD_MANAGER,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      index: true,
    },
    // Set for role === "buyer"; links the login to a Buyer account.
    buyer: { type: Schema.Types.ObjectId, ref: "Buyer", default: null, index: true },
    lastLoginAt: { type: Date, default: null },
    // Bumping this invalidates every previously issued session token.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    buyer: this.buyer ? this.buyer.toString() : null,
  };
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
