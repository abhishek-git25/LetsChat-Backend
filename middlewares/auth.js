import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utilit.js";
import { adminSecretKey } from "../app.js";
import { TryCatch } from "./error.js";
import { User } from "../models/user.js";

const isAthencticated =  TryCatch((req, res, next) => {
    const token = req.cookies['lets_chat_token']
    if (!token) {
        return next(new ErrorHandler("Please login first", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decodedData._id
    next()
})

const isAdminOnly = (req, res, next) => {
    const token = req.cookies['lets-chat-admin-token']
    if (!token) {
        return next(new ErrorHandler("Only admin can access this route", 401))
    }


    const secretKey = jwt.verify(token, process.env.JWT_SECRET)

    const isMatch = secretKey === adminSecretKey
    if (!isMatch) {
        return next(new ErrorHandler("Invalid admin key", 401))
    }
    next()
}

const socketAuthenticator = async (err , socket , next) => {

    try {
        if(err){
            return next(err)
        }

        const authToken = socket.request.cookies["lets_chat_token"]

        if(!authToken){
            return next(new ErrorHandler("Please login to access this route" , 401))
        }

        const decodedData = jwt.verify(authToken , process.env.JWT_SECRET)
        const user = await User.findById(decodedData._id)

        if(!user){
            return next(new ErrorHandler("Please login to access this route" , 401))
        }

        socket.user = user

        return next()

    } catch (error) {
     console.log(error); 
     return next(new ErrorHandler("Please login to access this route" , 401))  
    }
}



export { isAthencticated, isAdminOnly,socketAuthenticator }