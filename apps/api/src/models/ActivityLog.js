import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, enum: ["developer", "admin", "staff"], required: true },
    action: {
      type: String,
      enum: [
        "user_created",
        "user_access_updated",
        "product_created",
        "product_updated",
        "product_deleted",
        "inventory_imported",
        "inventory_adjusted",
        "company_reset",
        "company_access_updated",
        "dispatch_created",
        "return_created"
      ],
      required: true
    },
    entityType: {
      type: String,
      enum: ["company", "user", "product", "dispatch", "return"],
      required: true
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, trim: true, default: "" },
    quantity: { type: Number, min: 0 },
    movementType: { type: String, enum: ["dispatch", "return", "exchange", null], default: null },
    message: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

activityLogSchema.index({ companyId: 1, createdAt: -1 });
activityLogSchema.index({ companyId: 1, action: 1, createdAt: -1 });
activityLogSchema.index({ companyId: 1, actorRole: 1, createdAt: -1 });
activityLogSchema.index({ companyId: 1, movementType: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
