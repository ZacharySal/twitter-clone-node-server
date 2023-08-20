import User from "../models/User.js";

export const getUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("friends");
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("friends");

        res.status(200).json(user.friends);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};

export const addRemoveFriend = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        if (user.friends.includes(friendId)) {
            // remove from friend list
            user.friends = user.friends.filter((id) => id.toString() !== friendId);
            friend.friends = friend.friends.filter((fid) => fid.toString() !== id);
        } else {
            // add to friend list
            user.friends.push(friendId);
            friend.friends.push(id);
        }

        await user.save();
        await friend.save();

        const responseUser = await User.findById(id).populate("friends");
        res.status(200).json(responseUser);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};
