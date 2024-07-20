import { Like } from "../services/likeService.js";

const LikeHandler = async (req, res) => {
    const { postId } = req.params;
    const {userId} = req.session;

    try {
        const like = await Like(postId, userId);
        res.status(200).json(like);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};


export {LikeHandler}