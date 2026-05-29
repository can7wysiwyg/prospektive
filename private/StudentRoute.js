import express from "express";
const StudentRoute = express.Router();
import verify from "../middleware/verify.js";
import verifyStudent from "../middleware/studentWare.js";
import User from "../models/UserModel.js";
import Grades from "../models/GradesModel.js";
import Fees from "../models/FeesModel.js"

StudentRoute.get(
  "/student/get-student",
  verify,
  verifyStudent,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.json({ msg: "Authorization Error!" });
      }

      const student = await User.findOne({
        _id: req.user._id,
        role: "student",
      }).select("-accessToken -refreshToken -password");

      if (!student) {
        return res.json({ msg: "We are in a pickle!" });
      }

      res.json({ student });
    } catch (error) {
      console.log(`failed to get student, ${error}`);
      return res.json({ msg: "Failed to get details." });
    }
  }
);

StudentRoute.get(
  "/student/get-my-grades",
  verify,
  verifyStudent,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.json({ msg: "Authorization Error!" });
      }

      const student = await User.findOne({
        _id: req.user._id,
        role: "student",
      }).select("-accessToken -refreshToken -password");

      if (!student) {
        return res.json({ msg: "We are in a pickle!" });
      }

      const grades = await Grades.find({ student: student._id })
        .populate("lctr", "fullname email phone")
        .sort({ createdAt: -1 });

      if (!grades || grades.length === 0) {
        return res.json({ msg: "You have no grades at the moment" });
      }

      return res.json({
        grades,
      });
    } catch (error) {
      console.log(`failed to get my grades, ${error}`);
      return res.json({ msg: "Failed to get my grades." });
    }
  }
);


StudentRoute.get('/student/check-fees', verify, verifyStudent, async(req, res) => {
try {
      if (!req.user) {
        return res.json({ msg: "Authorization Error!" });
      }

      const student = await User.findOne({
        _id: req.user._id,
        role: "student",
      }).select("-accessToken -refreshToken -password");

      if (!student) {
        return res.json({ msg: "We are in a pickle!" });
      }


      const mystat = await Fees.findOne({student: req.user._id})

       res.json({mystat})


    
} catch (error) {
  console.log(`failed to check fees, ${error}`);
      return res.json({ msg: "Failed to check fees." });
  
}

})


StudentRoute.post('/student/pay-fees', verify, verifyStudent, async(req, res) => {
try {
      if (!req.user) {
        return res.json({ msg: "Authorization Error!" });
      }

      const student = await User.findOne({
        _id: req.user._id,
        role: "student",
      }).select("-accessToken -refreshToken -password");

      if (!student) {
        return res.json({ msg: "We are in a pickle!" });
      }


       await Fees.create({student: req.user._id, status: "paid"})

       res.json({message: "Fees Paid"})


    
} catch (error) {
  console.log(`failed to check fees, ${error}`);
      return res.json({ msg: "Failed to check fees." });
  
}

})




export default StudentRoute;
