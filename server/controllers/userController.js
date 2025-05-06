import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "dnjhynhiz",
  api_key: "218784618617246",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Configuration:", {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  api_secret: cloudinary.config().api_secret ? "Set" : "Not Set",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "post_media",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

const createUser = async (req, res) => {
  try {
    const { email, username, password, profilePhoto, selectedCategories } =
      req.body; // Destructure data from the request body
    console.log(selectedCategories);

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const userProfilePhoto = profilePhoto || null; 
    const newUser = new User({
      email,
      username,
      password, 
      profilePhoto,
      accountCreated: Date.now(),
      interestedCategories: selectedCategories,
    });

    await newUser.save();

    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      profilePhoto: newUser.profilePhoto,
    };

    return res.status(201).json(userResponse); //S Respond with a success status and user data
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ message: "Error creating user", error: error.message }); // Handle any errors
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (user.username === username && user.password === password) {
      return res.json({
        id: user._id,
        username: user.username,
        profilePhoto: user.profilePhoto,
      });
    }
  } catch (error) {
    console.error("Error logging user:", error);
    return res
      .status(500)
      .json({ message: "Error logging user", error: error.message });
  }
};

const changeProfilePhoto = (req, res) => {
  upload.single("profilePhoto")(req, res, async function (err) {
    if (err) {
      console.error("Error uploading file:", err);
      return res
        .status(400)
        .json({ message: "Error uploading file", error: err.message });
    }

    console.log("File after multer:", req.file);

    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (req.file) {
        if (user.profilePhoto) {
          const oldPhotoPublicId = user.profilePhoto
            .split("/")
            .pop()
            .split(".")[0];
          try {
            await promisify(cloudinary.uploader.destroy)(oldPhotoPublicId);
            console.log(
              `Old photo ${oldPhotoPublicId} deleted from Cloudinary`
            );
          } catch (deleteError) {
            console.error(
              "Error deleting old photo from Cloudinary:",
              deleteError
            );
          }
        }

        user.profilePhoto = req.file.path;
        await user.save();
        console.log("Profile photo updated successfully for user:", user);
        return res.status(200).json({
          message: "Profile photo updated successfully",
          profilePhoto: user.profilePhoto,
        });
      } else {
        return res.status(400).json({ message: "No file uploaded" });
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      return res.status(500).json({
        message: "Error updating profile photo",
        error: error.message,
      });
    }
  });
};

const getUserEmail = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Error getting user email:", error);
    return res
      .status(500)
      .json({ message: "Error getting user email", error: error.message });
  }
};

const changeUsername = async (req, res) => {
  try {
    const { userId, newUsername } = req.body;

    if (!userId || !newUsername) {
      return res
        .status(400)
        .json({ message: "User ID and new username are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = newUsername;
    await user.save();

    return res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Error updating username:", error);
    return res
      .status(500)
      .json({ message: "Error updating username", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, newPassword, oldPassword } = req.body;

    if (!userId || !newPassword || !oldPassword) {
      return res
        .status(400)
        .json({
          message: "User ID, new password, and old password are required",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {  
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return res
      .status(500)
      .json({ message: "Error getting user notifications", error: error.message });
  }
};

export {
  createUser,
  loginUser,
  changeProfilePhoto,
  getUserEmail,
  changeUsername,
  changePassword,
  getUserNotifications,
};
