import {isSelf as check, checkUserIdnoselectid} from '../services/userService.js';

const isSelfHandler = async (req, res) => {
    const { userId } = req.session;
    const { username } = req.params;
    // if (!userId) {
    //     res.status(401).json({ message: 'Unauthorized' });
    //     return;
    // }

    // if (!username) {
    //     res.status(401).json({ message: 'Unauthorized' });
    //     return;
    // }
    try {
        const isSelf = await check(userId, username);
        res.status(200).json({ isSelf });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const checkUserIdHandler = async (req,res) => {
    const {userId} = req.session;
    // if (!userId) {
    //     res.status(401).json({ message: 'Unauthorized' });
    //     return;
    // }
    try {
        const check = await checkUserIdnoselectid(userId);
        res.status(200).json({check});
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

export {isSelfHandler, checkUserIdHandler}