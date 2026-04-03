import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, lowercase: true, unique: true }
  },
  { timestamps: true }
);

companySchema.pre("validate", function normalizeCode(next) {
  if (this.code) {
    this.code = this.code.trim().toLowerCase();
  }

  return next();
});

export const Company = mongoose.model("Company", companySchema);
