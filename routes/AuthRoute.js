import express from "express"
const AuthRoute = express.Router()
import User from "../models/UserModel.js"
import  verify  from "../middleware/verify.js"
import { encryptId, decryptId } from "../middleware/cryptic.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


AuthRoute.post('/auth/login', async(req, res) => {
try {
  const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ msg: "A field cannot be empty!" });
    }

    const userExists = await User.findOne({email});

    if (!userExists) {
      return res.json({
        msg: `User with the email address, ${email}, does not exist. Create An Account`,
      });
    }

    const passwordMatch = await bcrypt.compare(password, userExists.password);

    if (passwordMatch) {
      let refreshtoken = createRefreshToken({ id: userExists._id });

      jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_USER, (err, user) => {
        if (err) return res.json({ msg: "Please Login or Create an Account" });

        const usertoken = createAccessToken({ id: user.id });

        const schoolKey = encryptId(user.id);

        User.updateOne(
          { _id: userExists._id },
          {
            accessToken: usertoken,
            refreshToken: refreshtoken,
          },
        ).then(() => {
          res.json({ schoolKey });
        });
      });
    } else {
      return res.json({ msg: "Wrong Password! Please Change Your Password." });
    }

    
} catch (error) {
    console.log(`failed to sign in, ${error}`)
    return res.json({msg: `Failed to sign in`})
}

})

AuthRoute.get("/auth/user-details", verify, async (req, res) => {
  try {
    if (!req.user)
      return res.status(400).json({ msg: "User does not exist." });

    res.json({ user: req.user });
  } catch (error) {
    console.log("Server Error while finding account details", error);
    res.json({
      msg: `Server Error while finding account details, ${error.message}`
    });
  }
});


AuthRoute.get("/auth/check-session", async (req, res) => {
  try {
    const { userKey } = req.query;

    if (!userKey) {
      return res.json({ msg: "Action not Possible!" });
    }

    const id = decryptId(userKey);

    const user = await User.findById(id);

    if (!user) {
      return res.json({ msg: "Request has been blocked" });
    }

    const userId = user._id.toString();
    const accessToken = user.accessToken;
    const refreshToken = user.refreshToken;

    if (!userKey || !accessToken) {
      return res.json({ msg: "Please Login" });
    }

    let validToken = accessToken;

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_USER);

      if (decoded.id !== userId) {
        return res.json({ msg: "Invalid action" });
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        try {
          const decodedRefresh = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_USER
          );
          if (decodedRefresh.id !== userId) {
            return res.json({ msg: "Invalid Resource" });
          }
            
          validToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_USER, {
            expiresIn: "15m",
          });

          await User.updateOne({ _id: userId }, { accessToken: validToken });
        } catch (refreshError) {
          return res.json({ msg: "login again." });
        }
      } else {
        return res.json({ msg: "Invalid token" });
      }
    }

    const response = await fetch(`${process.env.API_URL}/user/user-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userKey}`,
      },
    });

    if (!response.ok) {
      return res.json({ msg: "Server Error while fetching user" });
    }

    const data = await response.json();

    return res.json({ data });
  } catch (error) {
    console.log("Server Error XVI67-1", error.message);
    res.json({
      msg: `Server Error XVI67-1, ${error.message} `
    });
  }
});


AuthRoute.put('/auth/logout-user', verify, async(req, res) => {

  try {
    

        const user = await User.findById({ _id: req.user._id });

    if (!user) {
      return res.json({ msg: "This user does not exists!" });
    }

    await User.updateOne(
      { _id: req.user._id },
      {
        accessToken: "",
        refreshToken: ""
      }
    );

    res.json({ msg: "Successfully Logged Out!" });
    
  } catch (error) {
    console.log("Server Error XVI67-1 while signing out", error.message);
    res.json({
      msg: `Server Error XVI67-1 while signing out, ${error.message}`
    });

  }



})


const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_USER, { expiresIn: "15m" });
};
const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_USER, { expiresIn: "30d" });
};

export default AuthRoute