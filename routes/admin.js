import express from "express"
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashBoardStats } from "../controller/admin.js";
import { adminLoginValidator, validateHandler } from "../lib/validator.js";
import { isAdminOnly } from "../middlewares/auth.js";
const app = express.Router();

app.post("/verify" , adminLoginValidator() ,validateHandler,  adminLogin)
app.get("/logout" , adminLogout)

app.use(isAdminOnly)

app.get("/" , getAdminData)

app.get("/users", allUsers)
app.get("/chats", allChats)
app.get("/messages", allMessages)
app.get("/stats", getDashBoardStats)

export default app


