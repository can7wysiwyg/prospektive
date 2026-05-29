import express from "express"
const AdminAuth = express.Router()
import User from "../models/UserModel.js"
import bcrypt from "bcrypt";
import verify from "../middleware/verify.js";
import verifyAdmin from "../middleware/adminWare.js";

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


AdminAuth.post("/admin/create-user", verify, verifyAdmin, async (req, res) => {
  try {

    if(!req.user) {
      return res.json({msg: "Authorization Error!"})
    }

    const admin = await User.findOne({_id: req.user._id, role: 'admin'})

    if(!admin) {
      return res.json({msg: "We are in a pickle!"})
    }


    const { fullname, email, phone, password, dob, role } = req.body;

    if (!fullname || !email || !password || !phone || !dob || !role) {
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
    ...(cleanEmail ? [{ email: cleanEmail }] : [])
  ]
});

    if (userExists) {
      return res.json({
        msg: `Email or Phone Number is in use by someone in this system`,
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullname,
      email: cleanEmail,
      phone,
      dob,
      role,
      password: hashedPassword,
    });

    res.json({ message: "User Account Created Successfully!" });
  } catch (error) {
    return res.json({ msg: `Failed to register, ${error.message}` });
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

return res.json({students})

} catch (error) {
   console.log(`cannot view students, ${error}`)
  return res.json({msg: "Cannot view students"})
}

})



export default AdminAuth