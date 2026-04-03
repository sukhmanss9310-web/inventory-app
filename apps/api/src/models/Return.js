import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ["return", "exchange"], required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffName: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

returnSchema.index({ date: -1 });
returnSchema.index({ companyId: 1, date: -1 });

export const InventoryReturn = mongoose.model("InventoryReturn", returnSchema);
