import express from "express"
const AdminAuth = express.Router()
import User from "../models/UserModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


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




export default AdminAuth