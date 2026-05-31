import express from "express"
const PublicRoute = express.Router()
import Program from "../models/ProgramModel.js"


PublicRoute.get('/show-programs', async(req, res) => {
    try {

        const programs = await Program.find()

        if(!programs || programs.length === 0) {
            return res.json({msg: "We have no programs at the moment"})
        }

        res.json({programs})
        
    } catch (error) {
        console.log("failed to load courses", error)
        res.json({msg: "failed to load courses"})
    }
})


export default PublicRoute


