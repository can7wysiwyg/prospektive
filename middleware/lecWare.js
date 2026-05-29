import User from '../models/UserModel.js'

const verifyLecture = async(req, res, next) => {

    try {

        const user = await User.findOne({_id: req.user._id})

    

        if(user.role !== "lecturer" ) {

         return res.json({msg: "You are not authorized to perform this action"})
        } 
           next();
        
    } catch (error) {
        console.log("There was an error in verifying your permissions", error.message)
        res.json({msg: "Error verifying your permissions"})
    }
}

export default verifyLecture