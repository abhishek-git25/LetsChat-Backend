import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { v4 as uuid } from 'uuid'
import { v2 as cloudinary } from "cloudinary"
import { getBase64, getSockets } from "../lib/helper.js"


const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    httpOnly: true,
    secure: true
}

const connectDB = (uri) => {
    mongoose.connect(uri, { dbName: "lets_chat" })
        .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
        .catch((err) => {
            throw err
        })
}

const sendToken = (res, user, code, message) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
    console.log(token);
    return res.status(code).cookie("lets_chat_token", token, cookieOptions).json({
        success: true,
        token,
        message,
        user
    })
}

const emitEvent = (req, event, users, data) => {
    const io = req.app.get("io")
    const userSockets = getSockets(users)
    io.to(userSockets).emit(event, data)
}

const uploadFilesToCloudinary = async (files = []) => {

    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(getBase64(file), {
                resource_type: "auto",
                public_id: uuid()
            }, (error, result) => {
                if (error) return reject(error)
                resolve(result)
            })
        })
    })

    try {
        const results = await Promise.all(uploadPromises)
        const formattedResult = results.map((item) => ({
            public_id: item.public_id,
            url: item.secure_url
        }))

        return formattedResult
    } catch (error) {
        throw new Error("Error uploading files to cloudinary", error)
    }
}

const deleteFilesFromCloudinary = (public_ids) => {

}


export { connectDB, sendToken, cookieOptions, emitEvent, deleteFilesFromCloudinary, uploadFilesToCloudinary }