import express from "express"
const LecRoute = express.Router()
import verify from "../middleware/verify.js"
import verifyLecture from "../middleware/lecWare.js"
import User from "../models/UserModel.js"
import Grades from "../models/GradesModel.js"


LecRoute.get('/lecturer/students-enrolled', verify, verifyLecture, async(req, res) => {
try {
   if(!req.user) {
        return res.json({msg: "Authorization Error!"})
      }
  
      const lecturer = await User.findOne({_id: req.user._id, role: 'lecturer'})
  
      if(!lecturer) {
        return res.json({msg: "We are in a pickle!"})
      }

      const enrolled = await User.find({role: "student"}).select("fullname phone email")

      if(!enrolled || enrolled.length === 0) {
        return res.json({msg: "You have no enrolled students"})
      }
  
       res.json({enrolled}) 

  

    
} catch (error) {
    console.log(`failed to get enrolled students, ${error}`)
    return res.json({msg: "Failed to get enrolled students.."})
}

})


LecRoute.post('/lecturer/send-grades', verify, verifyLecture, async(req, res) => {

try {
    if(!req.user) {
        return res.json({msg: "Authorization Error!"})
      }
  
      const lecturer = await User.findOne({_id: req.user._id, role: 'lecturer'})
  
      if(!lecturer) {
        return res.json({msg: "We are in a pickle!"})
      }
  
      const {module_name, grades_list, studentId, studentEmail} = req.body 

      if(!module_name || !grades_list || !studentId || !studentEmail) {
        return res.json({msg: "Values are required to send grades to student"})
      }
  
         const findstu = await User.findOne({_id: studentId, email: studentEmail})

         if(!findstu) {
            return res.json({msg: "Student does not exists..."})
         }

         await Grades({
            lctr: req.user._id,
            student: studentId,
            module_name,
            grades_list
         })

         res.json({message: "Successfully sent grades to student."})

} catch (error) {
    console.log(`failed to send grades, ${error}`)
    return res.json({msg: "Failed to send grades.."})

}


})

export default LecRoute