import express from "express";
import bodyParser from "body-parser";
import mongoose, { Mongoose } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { verifyToken } from "./middleware/authorizeUser.js";
import { register } from "./controllers/authController.js";
import { createPost } from "./controllers/postController.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";

/* CONFIG */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ origin: "*", }));

app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

/* FILE STORAGE*/
const upload = multer({ dest: 'image_uploads/' });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);

/* MONGOOSE SETUP */
const PORT = process.env.port || 6001;
const connect_database = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    }
    catch (error) {
        console.log(`${error} did not connect`);
    }
};

connect_database();



