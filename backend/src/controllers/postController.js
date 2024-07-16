import { createPost, getAllPosts,deletePost, getpostbyId } from '../services/postService.js';
import { PostType } from '@prisma/client';
import {checkUsernames} from '../services/userService.js';

const createPostHandler = async (req, res) => {
  const { content } = req.body;
  const { userId } = req.session;
  const file = req.file;

  // if (!userId) {
  //   res.status(401).json({ message: 'Unauthorized' });
  //   return;
  // }

  // if (!content && !file) {
  //   res.status(400).json({ message: 'Content or file must be provided.' });
  //   return;
  // }

  let mediaUrl;
  let mediaType;

  if (file) {
    mediaUrl = file.path;
    if (file.mimetype.startsWith('image')) {
      mediaType = PostType.IMAGE;
    } else if (file.mimetype.startsWith('video')) {
      mediaType = PostType.VIDEO;
    }
  }

  const mentionRegex = /@([a-zA-Z0-9\-_]+)/g;
  const mentionedUsernamesWithAt = [...content.matchAll(mentionRegex)].map(match => match[0]);
  try {
    const mentionedUserId = await checkUsernames(mentionedUsernamesWithAt)
    const post = await createPost(userId, content || null, mediaUrl, mediaType, mentionedUserId);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPostsHandler = async (req, res) => {
  const { userId } = req.session;

  try {
    const posts = await getAllPosts(userId);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePostHandler = async (req, res) => {
  const { userId } = req.session;
  const { postId } = req.params;
  
  // if (!userId) {
  //   res.status(401).json({ message: 'Unauthorized' });
  //   return;
  // }

  // if (!postId) {
  //   res.status(401).json({ message: 'Unauthorized' });
  //   return;
  // }
  try {
    const post = await deletePost(postId, userId);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getpostbyIdHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await getpostbyId(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {createPostHandler, getAllPostsHandler, deletePostHandler, getpostbyIdHandler}