import express from "express";
import { RegisterHandler, LoginHandler, LogoutHandler, changepasswordHandler} from "../controllers/authController.js";

const router = express.Router();

router.post('/login',LoginHandler);
router.post('/register', RegisterHandler);
router.post('/logout', LogoutHandler);
router.post('/change/password', changepasswordHandler);

export default router;