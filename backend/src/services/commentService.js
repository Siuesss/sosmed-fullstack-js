import { prisma } from "../utils/prisma.js";
import { generateCustomUUID as UUID} from "../utils/uuid.js";

const createComment = async (authorId, postId, content) => {
    return await prisma.comment.create({
        data: {
            id: UUID(),
            authorId,
            postId,
            content
        }
    });
};

export {createComment}