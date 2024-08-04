import express from "express"
import { acceptFriendRequest, getAllNotifications, getMyFriends, getMyProfile, login, logout, newUsers, searchUser, sendFriendRequest } from "../controller/user.js"
import { singleAvatar } from "../middlewares/multer.js";
import { isAthencticated } from "../middlewares/auth.js";
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validateHandler } from "../lib/validator.js";

const app = express.Router();


app.post("/new", singleAvatar, registerValidator(), validateHandler, newUsers)
app.post("/login", loginValidator() , validateHandler,  login)


// After this user must be logged in to access routes
app.use(isAthencticated)

app.get('/me', getMyProfile)
app.get('/logout', logout)
app.get('/search', searchUser)
app.put("/sendrequest" ,sendRequestValidator() , validateHandler, sendFriendRequest)
app.get("/notifications" , getAllNotifications)
app.put("/acceptrequest" , acceptRequestValidator() , validateHandler , acceptFriendRequest)
app.get("/getFriends" , getMyFriends)

export default app