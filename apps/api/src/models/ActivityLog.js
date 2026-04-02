import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, enum: ["admin", "staff"], required: true },
    action: {
      type: String,
      enum: [
        "user_created",
        "product_created",
        "product_updated",
        "product_deleted",
        "dispatch_created",
        "return_created"
      ],
      required: true
    },
    entityType: { type: String, enum: ["user", "product", "dispatch", "return"], required: true },
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

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ actorRole: 1, createdAt: -1 });
activityLogSchema.index({ movementType: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
