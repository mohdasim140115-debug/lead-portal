import mongoose from "mongoose";

const { Schema } = mongoose;

// Lightweight registry for category / subcategory names — powers filter
// dropdowns and (later) pricing rules. Leads store the name string directly so
// renaming here never orphans lead data.
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parent: { type: String, default: null, trim: true }, // parent category name, null = top level
    leadCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ parent: 1, name: 1 });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
