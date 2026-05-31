import mongoose from "mongoose";

const TeachSchema = mongoose.Schema({

    lect_urer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
            prog_id: {
                type: String,
                required: true,
            
            }
     

}, {
    timestamps: true
})

export default mongoose.model('Teaching', TeachSchema)