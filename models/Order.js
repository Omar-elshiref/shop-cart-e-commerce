import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    items: [{
        product: { type: String, ref: 'Product', required: true },
        quantity: { type: Number, required: true,}
    }],
    amount: { type: Number, required: true },
    address: { type: String, required: true, ref: 'address' },
    status: { type: String, default: 'order placed', required: true },
    data: { type: Number, required: true,}
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;

