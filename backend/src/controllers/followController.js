import { followUser } from "../services/followService.js";
import { checkUsername } from "../services/userService.js";

const followUserHandler = async (req, res) => {
    const { userId } = req.session;
    const { username } = req.params;

    // if (!userId) {
    //     res.status(401).json({ message: 'Unauthorized' });
    //     return;
    // }

    // if (!username) {
    //     res.status(400).json({ message: 'Bad Request: "tujuan" is required' });
    //     return;
    // }

    try { 
        const existingFollowing = await checkUsername(username);
        if (!existingFollowing) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // if (userId === existingFollowing.id) {
        //     res.status(400).json({ error: 'Cannot follow yourself' });
        //     return;
        // }

        const followed = await followUser(userId, existingFollowing.id);
        res.status(200).json({ followed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { followUserHandler };