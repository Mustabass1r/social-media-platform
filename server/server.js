import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import postRouter from "./routes/posts.js";
import userRouter from "./routes/users.js";
import communityRouter from "./routes/communities.js";
import userPostRouter from "./routes/userPost.js";

dotenv.config();

const app = express();

app.use(cors());

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

app.use(express.json());

app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/communities', communityRouter);
app.use('/userPost', userPostRouter);

console.log('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});

