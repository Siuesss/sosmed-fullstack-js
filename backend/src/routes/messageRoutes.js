import express from "express";
import { newMessageHandler, getMessageHandler,getLastMessageHandler } from "../controllers/messageController.js";
import upload from '../config/multer.js';

const router = express.Router();

router.post('/:username', upload.single('file'), newMessageHandler);
router.get('/:username', getMessageHandler);
router.get('/last/me',getLastMessageHandler);

export default router;