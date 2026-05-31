import mongoose from "mongoose";

const ProgramSchema = mongoose.Schema({
    prog_id: {
        type: String,
        unique: true,
        required: true
    },
    prog_name: {
        type: String,
        unique: true,
        required: true
    },

}, {
    timestamps: true
})


export default mongoose.model('Program', ProgramSchema)