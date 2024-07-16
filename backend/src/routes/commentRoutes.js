import {createCommentHandler} from '../controllers/commentController.js';
import express from 'express';

const router = express.Router();

router.post('/create/:id', createCommentHandler);

export default router;