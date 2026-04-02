import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, required: true, unique: true, uppercase: true },
    stock: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

productSchema.pre("validate", function normalizeSku(next) {
  if (this.sku) {
    this.sku = this.sku.toUpperCase();
  }

  return next();
});

productSchema.virtual("isLowStock").get(function isLowStock() {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export const Product = mongoose.model("Product", productSchema);
