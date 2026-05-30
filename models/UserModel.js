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
        unique: true,
        sparse: true
    },
    password:  {
        type: String,
        required: true
    },
    dob:  {
        type: Date,
    
    },
    student_reg: {
       type: String,
       sparse: true,
       
       
    },
    gender: {
    type: String
    },
    program: {
    type: String
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