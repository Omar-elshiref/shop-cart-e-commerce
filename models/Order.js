import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, ref: "user", required: true },
  items: [
    {
      product: { type: String, ref: "product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: "address" },
  status: { type: String, default: "order placed", required: true },
  data: { type: Number, required: true },
});

const Order = mongoose.models.Order || mongoose.model("order", orderSchema);

export default Order;
