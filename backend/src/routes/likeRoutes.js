import {LikeHandler} from '../controllers/likeController.js';
import express from 'express';

const router = express.Router();

router.post('/:postId', LikeHandler);

export default router;