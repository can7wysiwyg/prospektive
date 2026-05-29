import mongoose from "mongoose";

const UserSchema = mongoose.Schema({

    fullname: {
        type: String,
        required: true
    },
    email:  {
        type: String,
        required: true,
        unique: true
    },
    phone:  {        
        type: Number,

        unique: true
    },
    password:  {
        type: String,
        required: true
    },
    dob:  {
        type: Date,
    
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'lecturer', 'default'],
        default: 'default'
    },
    accessToken: {
        type: String,
    
    },
    refreshToken: {
        type: String,
    
    },



}, {
    timestamps: true
})


export default mongoose.model('User', UserSchema)