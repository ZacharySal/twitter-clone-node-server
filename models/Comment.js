import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    content: {
        type: String,
        required: true,
        min: 1,
        max: 100,
    },
    likes: {
        type: Map,
        of: Boolean
    },
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;