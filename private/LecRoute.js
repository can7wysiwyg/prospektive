import express from "express"
const LecRoute = express.Router()
import verify from "../middleware/verify.js"
import verifyLecture from "../middleware/lecWare.js"
import User from "../models/UserModel.js"
import Grades from "../models/GradesModel.js"
import Program from "../models/ProgramModel.js"
import Teaching from "../models/TeachModel.js"
import XLSX from "xlsx";
import fs from "fs";
import path from "path";


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

         await Grades.create({
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



LecRoute.get('/lecture/course-students', verify, verifyLecture, async(req, res) => {
try {
  
   const getteach = await Teaching.findOne({lect_urer: req.user._id})

   if(!getteach) {
    return res.json({msg: "Looks like no program was assigned to you."})
   }

   const getprog = await Program.findOne({prog_id: getteach.prog_id })

   if(!getprog) {
        return res.json({msg: "Your assigned program does not exists!"})

   }

   const enrolled = await User.find({program: getprog.prog_id}).select("fullname email phone")

   

   let prog_details = {
     name: getprog.prog_name,
     id: getprog.prog_id 
   }

  res.json({enrolled, prog_details}) 

} catch (error) {
  console.log(`failed to get course students, ${error}`)
    return res.json({msg: "Failed to get course students.."})
 


}


})

LecRoute.post(
  "/lecturer/import-grades",
  verify,
  verifyLecture,
  async (req, res) => {
    try {

      if (!req.files || !req.files.file) {
        return res.status(400).json({ msg: "No file uploaded." });
      }

      const uploadedFile = req.files.file;

      const allowed = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      ];

      if (!allowed.includes(uploadedFile.mimetype)) {
        return res.status(400).json({
          msg: "Only Excel files (.xlsx, .xls) are allowed."
        });
      }

      const { module_name, program } = req.body;

      if (!module_name || !program) {
        return res.json({ msg: "Missing module_name or program" });
      }

      
      const workbook = XLSX.read(uploadedFile.data, { type: "buffer" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        return res.status(400).json({
          msg: "The spreadsheet is empty."
        });
      }

      const results = {
        imported: [],
        skipped: [],
        errors: []
      };

      for (const row of rows) {

        const email = String(row["student_email"] || "").trim().toLowerCase();
        const grade = String(row["grade"] || "").trim();

        if (!email || !grade) {
          results.errors.push({
            email,
            reason: "Missing email or grade"
          });
          continue;
        }

        const student = await User.findOne({
          email,
          role: "student",
          program
        });

        if (!student) {
          results.skipped.push({
            email,
            reason: "Student not found in program"
          });
          continue;
        }

        
        const existing = await Grades.findOne({
          student: student._id,
          module_name
        });

        if (existing) {

          existing.grade = grade;
          existing.lctr = req.user._id;

          await existing.save();

        } else {

          await Grades.create({
            lctr: req.user._id,
            student: student._id,
            program,
            module_name,
            grade
          });
        }

        results.imported.push({
          email,
          grade
        });
      }

      return res.status(200).json({
        message: `Import complete. ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.errors.length} errors.`,
        results
      });

    } catch (error) {

      console.error("Grade import failed:", error);

      return res.status(500).json({
        msg: "Failed to import grades"
      });
    }
  }
);

export default LecRoute