import mongoose from "mongoose";

const GradesSchema = mongoose.Schema({
 lctr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
 },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
 },

 module_name: {
  type: String,
  required: true

 },
 grades_list: {
    type: String,
    required: true
 }




}, {
    timestamps: true
})


export default mongoose.model('Grades', GradesSchema)