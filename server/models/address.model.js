import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  address_line: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  state: {
    type: String,
    default: ""
  },
  pincode: {
    type: String
  },
  mobile: {
    type: Number,
    required: true,
    match: /^[0-9]{8,15}$/,
  },
  status: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    default: ""
  }
}, {
  timestamps: true
})

const AddressModel = mongoose.model('address', addressSchema)

export default AddressModel