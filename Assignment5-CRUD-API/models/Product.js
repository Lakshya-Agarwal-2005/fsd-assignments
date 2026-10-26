const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Skincare", "Stationery"],
    },
    price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    stock: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Product", productSchema);
