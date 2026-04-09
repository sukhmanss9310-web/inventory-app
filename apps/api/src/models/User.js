import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["developer", "admin", "staff"],
      default: "staff"
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1, email: 1 }, { unique: true });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject(company = null) {
  return {
    id: this._id,
    companyId: company?._id || this.companyId,
    companyName: company?.name,
    companyCode: company?.code,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive !== false,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const User = mongoose.model("User", userSchema);
