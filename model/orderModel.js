import mongoose, { mongo } from "mongoose";

const orderSchema = new mongoose.Schema({
    orderDate: {
        type: String
    },
    status: {
        type: String,
        default: 'Placed',
        enum: ["Pending", "Processing", "At Local Facility", "Out for Delivery", "Delivered", "Cancelled"]
    },
    deliveryTime: {
        type: String,
    },
    amount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: String,
        required: true
    },
    billingAddress: {
        type: String,
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Paypal', 'COD'], // Allowed payment modes
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    quantity: {
        type: Number,
        default: 1
    },
    payment: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    orderId: {
        type: String
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Order = mongoose.model('order', orderSchema);

export default Order;