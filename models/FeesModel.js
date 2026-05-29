import mongoose from "mongoose";

const FeesSchema = mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending'
    }


}, {
    timestamps: true
})

export default mongoose.model('Fees', FeesSchema)