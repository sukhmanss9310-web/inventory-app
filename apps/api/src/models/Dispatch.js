import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffName: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dispatchSchema.index({ date: -1 });

export const Dispatch = mongoose.model("Dispatch", dispatchSchema);
