import { createComment } from "../services/commentService.js";

const createCommentHandler = async (req, res) => {
    const { content } = req.body;
    const { userId } = req.session;
    const { id } = req.params;

    try {
        const comment = await createComment(userId, id, content);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export {createCommentHandler}