import mongoose from "mongoose";

const installationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pendiente", "en progreso", "completada"],
    default: "pendiente"
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Installation = mongoose.model("Installation", installationSchema);

export default Installation; 
