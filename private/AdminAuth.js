import express from "express"
const AdminAuth = express.Router()
import User from "../models/UserModel.js"
//import bcrypt from "bcrypt";
import verify from "../middleware/verify.js";
import verifyAdmin from "../middleware/adminWare.js";
import Fees from "../models/FeesModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import XLSX from "xlsx"
import bcrypt from "bcryptjs"

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}




AdminAuth.post("/admin/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.json({ msg: `Field cannot be empty!` });
    }

    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
      return res.json({ msg: "Invalid Email address" });
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.json({
        msg: `Email was already used by someone`,
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    res.json({ message: "Admin Account Created Successfully! You Can Sign In" });
  } catch (error) {
    return res.json({ msg: `Failed to register, ${error.message}` });
  }
});



AdminAuth.post('/admin/import-students', verify, verifyAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }
    
        const uploadedFile = req.files.file;

     
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowed.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ msg: 'Only Excel files (.xlsx, .xls) are allowed.' });
    }

    
    const workbook = XLSX.read(uploadedFile.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) {
      return res.status(400).json({ msg: 'The spreadsheet is empty.' });
    }

    const results = { imported: [], skipped: [], errors: [] };

    for (const row of rows) {
      const fullname    = String(row['fullname']    || row['Full Name']  || '').trim();
      const email       = String(row['email']       || row['Email']      || '').trim().toLowerCase();
      const phone       = String(row['phone']       || row['Phone']      || '').trim();
      const student_reg = String(row['student_reg'] || row['Student Reg']|| '').trim();
      const program     = String(row['program']     || row['Program']    || '').trim();
      const gender      = String(row['gender']      || row['Gender']     || '').trim();

      if (!fullname || !email || !student_reg) {
        results.errors.push({
          row: student_reg || email || fullname,
          reason: 'Missing required fields: fullname, email, or student_reg',
        });
        continue;
      }

      const exists = await User.findOne({ $or: [{ email }, { student_reg }] });
      if (exists) {
        results.skipped.push({ student_reg, email, reason: 'Duplicate email or student_reg' });
        continue;
      }

      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await new User({
        fullname,
        email,
        phone: phone ? Number(phone.replace(/\D/g, '')) : undefined,
        student_reg,
        program,
        gender,
        password: hashedPassword,
        role: 'student',
      }).save();

      results.imported.push({ fullname, email, student_reg, temporaryPassword: plainPassword });
    }

    return res.status(200).json({
      message: `Import complete. ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.errors.length} errors.`,
      imported: results.imported,
      
    });

  } catch (error) {
    console.error(`Failed to import students: ${error}`);
    return res.status(500).json({ msg: `Failed to import: ${error.message}` });
  }
});


AdminAuth.post("/admin/create-user", verify, verifyAdmin, async (req, res) => {
  try {

    if(!req.user) {
      return res.json({msg: "Authorization Error!"})
    }

    const admin = await User.findOne({_id: req.user._id, role: 'admin'})

    if(!admin) {
      return res.json({msg: "We are in a pickle!"})
    }


    const { fullname, email, phone,  student_reg, program, gender } = req.body;

    if (!fullname || !email || !phone || !student_reg || !program || !gender) {
      return res.json({ msg: `Field cannot be empty!` });
    }

        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email?.trim() && !regex.test(email.trim())) {
  return res.json({ msg: "Invalid Email address" });
}
   const cleanEmail = email && email.trim() !== "" 
                   ? email.trim().toLowerCase() 
                   : null;

const userExists = await User.findOne({
  $or: [
    { phone: phone },
    {student_reg},
    ...(cleanEmail ? [{ email: cleanEmail }] : [])
  ]
});


    if (userExists) {
      return res.json({
        msg: `Email or Phone Number is in use by someone in this system`,
      });
    }

    const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

   const final = await User.create({
      fullname,
      email: cleanEmail,
      phone,
      role: "student",
      student_reg,
      program,
      gender,
      password: hashedPassword,
    });

    let stu_details = {
      name: final.fullname,
      email: final.email,
      pass: plainPassword
    }

    res.json({ message: "User Account Created Successfully!", stu_details });
  } catch (error) {
    console.log(`failed to register student ${error}`)
    return res.json({ msg: `Failed to register` });
  }
});


AdminAuth.get('/admin/view-lecturers', verify, verifyAdmin, async(req, res) => {
try {
  if(!req.user) {
      return res.json({msg: "Authorization Error!"})
    }

    const admin = await User.findOne({_id: req.user._id, role: 'admin'})

    if(!admin) {
      return res.json({msg: "We are in a pickle!"})
    }
 
const lecturers = await User.find({role: "lecturer"})

if(!lecturers || lecturers.length === 0) {
  return res.json({msg: "We have no lecturers at the moment"})
}

return res.json({lecturers})

} catch (error) {
   console.log(`cannot view lecturers, ${error}`)
  return res.json({msg: "Cannot view lecturers"})
}

})


AdminAuth.get('/admin/view-students', verify, verifyAdmin, async(req, res) => {
try {
  if(!req.user) {
      return res.json({msg: "Authorization Error!"})
    }

    const admin = await User.findOne({_id: req.user._id, role: 'admin'})

    if(!admin) {
      return res.json({msg: "We are in a pickle!"})
    }
 
const students = await User.find({role: "student"})

if(!students || students.length === 0) {
  return res.json({msg: "We have no students at the moment"})
}

 res.json({students})

} catch (error) {
   console.log(`cannot view students, ${error}`)
  return res.json({msg: "Cannot view students"})
}

})

//fees

AdminAuth.get('/admin/view-fees/:id', verify, verifyAdmin, async(req, res) => {

  try {
   if(!req.user) {
      return res.json({msg: "Authorization Error!"})
    }

    const admin = await User.findOne({_id: req.user._id, role: 'admin'})

    if(!admin) {
      return res.json({msg: "We are in a pickle!"})
    }

    const {id} = req.params

    if(!id) {
      return res.json({msg: 'Authorization Not Available'})
    }

    const fees = await Fees.findOne({student: id}) 

    res.json({fees})


    
  } catch (error) {
     console.log(`cannot view student fees, ${error}`)
  return res.json({msg: "Cannot view student fees"})
  }

})

export default AdminAuth