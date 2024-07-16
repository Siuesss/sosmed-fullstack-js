import express from 'express';
import { createPostHandler, getAllPostsHandler, deletePostHandler,getpostbyIdHandler } from '../controllers/postController.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/create', upload.single('file'), createPostHandler);
router.get('/content', getAllPostsHandler);
router.delete('/delete/:postId', deletePostHandler);
router.get('/:id', getpostbyIdHandler);

export default router;