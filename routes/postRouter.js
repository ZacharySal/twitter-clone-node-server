import express from "express";
import {
    getAllPosts,
    getUserPosts,
    likePost,
    addComment,
    likeComment,
    getImage
} from "../controllers/postController.js";
import { verifyToken } from "../middleware/authorizeUser.js";

const router = express.Router();

router.get("/", verifyToken, getAllPosts);
router.get("/:userId", verifyToken, getUserPosts);
router.get("/image/:key", verifyToken, getImage);
router.patch("/comment/:commentId/like", verifyToken, likeComment);
router.patch("/:postId/comment", verifyToken, addComment);
router.patch("/:postId/like", verifyToken, likePost);

export default router;