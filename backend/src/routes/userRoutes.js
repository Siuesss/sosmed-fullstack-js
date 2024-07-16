import {isSelfHandler, checkUserIdHandler} from '../controllers/userController.js'
import express from 'express'

const router = express.Router();

router.get('/:username', isSelfHandler);
router.get('/', checkUserIdHandler)

export default router;