import { followUser } from "../services/followService.js";
import { checkUsername } from "../services/userService.js";

const followUserHandler = async (req, res) => {
    const { userId } = req.session;
    const { username } = req.params;


    try { 
        const existingFollowing = await checkUsername(username);
        if (!existingFollowing) {
            res.status(404).json({ error: 'User not found' });
            return;
        }


        const followed = await followUser(userId, existingFollowing.id);
        res.status(200).json({ followed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { followUserHandler };