import { getProfilbyusername, editProfil } from '../services/profilService.js';
import {checkUsername} from '../services/userService.js';

const getProfilbyusernameHandler = async (req, res) => {
    const { username } = req.params;
    const loggedInUserId = req.session.userId;

    try {

        const user = await checkUsername(username);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const profil = await getProfilbyusername(user.id, loggedInUserId);
        res.status(200).json(profil);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const editProfilHandler = async (req, res) => {
    const { userId } = req.session;
    const { name, username } = req.body;
    const image = req.file;
  
  
    let mediaUrl;
    if (image) {
      mediaUrl = image.path;
    }
  
    try {
      const result = await editProfil(userId, name || null, username || null, mediaUrl);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        res.status(400).json({ message: 'User not found' });
      } else if (error.message === "Username can only be changed once every 30 days.") {
        res.status(400).json({ message: "Username can only be changed once every 30 days." });
      } else {
        console.log(error)
        res.status(500).json({ error: error.message });
      }
    }
  }

export { getProfilbyusernameHandler,editProfilHandler };