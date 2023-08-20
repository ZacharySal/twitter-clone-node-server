import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { uploadFile } from "../s3.js";

/* REGISTER USER */
export const register = async (req, res) => {
    try {
        let result;
        if (req.file) {
            const file = req.file;
            result = await uploadFile(file);
        }

        const {
            firstName,
            lastName,
            email,
            password,
            friends,
            location,
            occupation
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newEmail = email.toLowerCase();


        /* TODO: add default picture path is none is provided*/

        const newUser = new User({
            firstName,
            lastName,
            email: newEmail,
            password: passwordHash,
            pictureKey: req.file ? result.Key : "f516ddf3458951425013d41b0a9742b0",
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 1000),
            impressions: Math.floor(Math.random() * 1000),
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const updatedEmail = email.toLowerCase();

        const user = await User.findOne({ email: updatedEmail }).populate("friends");
        if (!user) return res.status(400).json({ msg: "Sorry, account not found. Please try again." });

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return res.status(400).json({ msg: "Invalid credentials. Please try again." });

        const token = jwt.sign({ id: user._id, }, process.env.JWT_SECRET);
        delete user.password;
        res.status(200).json({ token, user });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}; 