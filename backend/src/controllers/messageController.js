import { newMessage, getMessage, getLastMessage } from "../services/messageService.js";
import {checkUserId} from '../services/userService.js'
import { checkUsername } from '../services/userService.js';
import { io } from "../server.js";
import dotenv from 'dotenv';
import { PostType } from '@prisma/client';

dotenv.config();

const newMessageHandler = async (req, res) => {
    const { userId } = req.session;
    const { content } = req.body;
    const { username } = req.params;
    const file = req.file;

    try {
        let mediaUrl;
        let mediaType;

        if(file){
            mediaUrl = file.path;
            if(file.mimetype.startsWith('image')){
                mediaType = PostType.IMAGE;
            }else if (file.mimetype.startsWith('video')){
                mediaType = PostType.VIDEO
            }
        }
        const sender = await checkUserId(userId);
        const receiver = await checkUsername(username);

        if (!sender || !receiver) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const message = await newMessage(sender.id, receiver.id, content || null, mediaUrl, mediaType);
        const fullMessage = {
            ...message,
            sender: {
                username: sender.username,
            },
        };
        io.emit('newMessage', fullMessage);
        res.status(200).json(fullMessage);
    } catch (error) {
        console.error('Error handling new message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMessageHandler = async (req, res) => {
    const { userId } = req.session;
    const { username } = req.params;

    try {
        const sender = await checkUserId(userId);
        const receiver = await checkUsername(username);

        const sanitizedMessages = await getMessage(sender.id, receiver.id);
        res.status(200).json(sanitizedMessages);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getLastMessageHandler = async (req, res) => {
    const { userId } = req.session;
  
    try {
  
      const lastChats = await getLastMessage(userId);
      res.status(200).json(lastChats);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

export { newMessageHandler, getMessageHandler, getLastMessageHandler };