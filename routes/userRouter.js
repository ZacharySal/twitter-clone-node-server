import express from "express";
import {
    getUserInfo,
    getUserFriends,
    addRemoveFriend,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authorizeUser.js";

const router = express.Router();


router.get("/:id", verifyToken, getUserInfo);
router.get("/:id/friends", verifyToken, getUserFriends);

router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;

