import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
    product_details: {
        name: String,
        image: Array
    },
    withInstallation: {
        type: Boolean,
        default: false
    },
    installation_status: {
        type: String,
        enum: ["Pendiente", "En curso", "Completado", "Cancelado"],
        default: "Pendiente"
    },
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: "address"
    },
    subTotalAmt: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    invoice_receipt: {
        type: String,
        default: ""
    },
    comprobante: {
        tipo: String,
        numero: String,
        pdf_url: String,
        sunat_ticket: String,
    },      
}, {
    timestamps: true
});

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
