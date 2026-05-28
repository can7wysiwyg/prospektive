import jwt from 'jsonwebtoken';
import { decryptId } from './cryptic.js'
import User from '../models/UserModel.js'

const verify = async (req, res, next) => {
  try {
  
    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {

const key = req.headers.authorization.split(' ')[1]

const decryptedKey = decryptId(key)



    const user = await User.findById(decryptedKey); 
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
   
    const userId = user._id.toString();
    const acesstoken = user.accessToken;
    
    const isValidKey = userId === decryptedKey


    
    if (!isValidKey || !acesstoken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

   
    const decoded = jwt.verify(acesstoken, process.env.ACCESS_TOKEN_USER);
    if (decoded.id !== userId) {
      return res.status(401).json({ msg: "Token  mismatch" });
    }

    
    req.user = await User.findById(decoded.id).select('-password -refreshToken -accessToken');
          
    next();
  }

    

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: "Access token expired" });
    }

    console.log("Middleware error:", error.message);
    return res.status(500).json({ msg: `Middleware server error,  ${error.message}` });
  }
};




export default verify 
