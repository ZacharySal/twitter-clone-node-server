import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

import { uploadFile, getFileStream } from "../s3.js";

export const createPost = async (req, res) => {
    try {
        let result;
        if (req.file) {
            const file = req.file;
            result = await uploadFile(file);
        }

        const { userId, location, content } = req.body;
        const user = await User.findById(userId);
        const newPost = new Post({
            userId,
            location: location ? location : user.location,
            content,
            pictureKey: req.file ? result.Key : null,
            likes: {},
            comments: [],
        });

        await newPost.save();
        const allPosts = await Post.find().sort('-createdAt').populate("comments").exec();
        res.status(201).json(allPosts);
    } catch (err) {
        res.status(409).json({ msg: err.message });
    }
};

export const getImage = async (req, res) => {
    try {
        const key = req.params.key;
        const readStream = getFileStream(key);
        readStream.pipe(res);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const allPosts = await Post.find().populate("comments").sort('-createdAt').exec();
        res.status(200).json(allPosts);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const userPosts = await Post.find({ userId }).populate("comments").sort('-createdAt').exec();;
        res.status(200).json(userPosts);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(postId);
        const isLiked = post.likes.get(userId);

        if (isLiked) {
            post.likes.delete(userId);
        } else {
            post.likes.set(userId, true);
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, { likes: post.likes }, { new: true });
        res.status(200).json(updatedPost);
    } catch (err) {
        console.log(err);
        res.status(404).json({ msg: err.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, content } = req.body;
        const newComment = new Comment({
            userId,
            postId,
            content,
            likes: {},
        });
        await newComment.save();

        // we have to find the specified post, then push the comment, we can then populate the comments and send that back
        const post = await Post.findById(postId);
        post.comments.push(newComment._id);
        await post.save();
        const updatedPost = await Post.findById(postId).populate("comments");
        res.status(201).json(updatedPost);

    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId, postId } = req.body;

        const comment = await Comment.findById(commentId);
        const isLiked = comment.likes.get(userId);

        if (isLiked) {
            comment.likes.delete(userId);
        } else {
            comment.likes.set(userId, true);
        }

        await comment.save();
        const post = await Post.findById(postId).populate("comments");
        res.status(201).json(post);

    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

// export const addCommentReply = async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const { userId, content } = req.body;
//         console.log(req.body);
//         const newComment = new Comment({
//             userId,
//             postId,
//             content,
//             likes: {},
//             replies: [],
//         });
//         await newComment.save();

//         const post = await Post.findById(postId);
//         post.comments.push(newComment._id);
//         await post.save();
//         res.status(201).json(post);

//     } catch (err) {
//         res.status(404).json({ msg: err.message });
//     }
// };