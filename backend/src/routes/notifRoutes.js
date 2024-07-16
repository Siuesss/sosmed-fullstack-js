import { getNotifHandler } from "../controllers/notifController.js";
import express from 'express'

const router = express.Router();

router.get('/all', getNotifHandler);

export default router;