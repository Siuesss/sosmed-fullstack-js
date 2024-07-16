import express from 'express';
import { followUserHandler } from '../controllers/followController.js';

const router = express.Router();

router.post('/:username', followUserHandler);

export default router;