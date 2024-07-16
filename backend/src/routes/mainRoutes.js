import express from 'express'
import authRoutes from './authRoutes.js';
import chatRoutes from './messageRoutes.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import likeRoutes from './likeRoutes.js';
import commentRoutes from './commentRoutes.js';
import profilRoutes from './profilRoutes.js';
import followRoutes from './followRoutes.js';
import notifRoutes from './notifRoutes.js'


const app = express();

app.use('/auth', authRoutes);
app.use('/message', chatRoutes);
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/like', likeRoutes);
app.use('/comment', commentRoutes);
app.use('/profil', profilRoutes);
app.use('/follow', followRoutes);
app.use('/notif', notifRoutes);

export default app;