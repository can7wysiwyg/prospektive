import mongoose from "mongoose";
const GradesSchema = mongoose.Schema(
{
  lctr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  program: {
    type: String,
    required: true
  },

  module_name: {
    type: String,
    required: true
  },

  grade: {
    type: String,
    required: true
  }

},
{
  timestamps: true
}
);

export default mongoose.model("Grades", GradesSchema);