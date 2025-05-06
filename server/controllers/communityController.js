import Community from '../models/community.js'; // Adjust the path based on your folder structure
import User from '../models/user.js';
import Post from '../models/post.js';
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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "community_photos",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

const createCommunity = async (req, res) => {
  console.log("Received request to create community");
  upload.single("communityPhoto")(req, res, async function (err) {
    if (err) {
      console.error("Error uploading file:", err);
      return res
        .status(400)
        .json({ message: "Error uploading file", error: err.message });
    }

    console.log("Request body after multer:", req.body);
    console.log("File after multer:", req.file);

    try {
      const { communityName, category, description, userId } = req.body;

      if (!communityName || !category || !description || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let communityPhotoUrl = "";
      if (req.file) {
        communityPhotoUrl = req.file.path; 
      }

      const newCommunity = new Community({
        communityName,
        category,
        description,
        communityPhoto: communityPhotoUrl || null,
        users: [userId],
      });

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.joinedCommunities.push(newCommunity._id);

      user.ownedCommunities.push(newCommunity._id);

      await user.save();

      const savedCommunity = await newCommunity.save();
      console.log("Community saved successfully:", savedCommunity);
      res.status(201).json(savedCommunity);
    } catch (error) {
      console.error("Error creating community:", error);
      res
        .status(500)
        .json({ message: "Error creating community", error: error.message });
    }
  });
};


const joinCommunity = async (req, res) => {
  console.log("Received request to join community");
  const { userId, communityId } = req.query;

  if (!userId || !communityId) {
    return res.status(400).send('User ID and Community ID are required');
  }

  try {
    const user = await User.findById(userId);
    const community = await Community.findById(communityId);

    if (!user || !community) {
      return res.status(404).json({ message: "User or Community not found" });
    }

    if (!community.users.includes(userId)) {
      community.users.push(userId);
      user.joinedCommunities.push(communityId);

      await Promise.all([community.save(), user.save()]);

      console.log('Community joined successfully');
      res.status(200).json({ message: 'Community joined successfully', isJoined: true });
    } else {
      res.status(200).json({ message: 'User already joined this community', isJoined: true });
    }
  } catch (err) {
    console.error('Error joining community:', err);
    res.status(500).send(err.message);
  }
}

const leaveCommunity = async (req, res) => {
  console.log("Received request to leave community");
  const { userId, communityId } = req.query;

  if (!userId || !communityId) {
    return res.status(400).send('User ID and Community ID are required');
  }

  try {
    const user = await User.findById(userId);
    const community = await Community.findById(communityId);

    if (!user || !community) {
      return res.status(404).json({ message: "User or Community not found" });
    }

    if (community.users.includes(userId)) {
      community.users = community.users.filter(id => id.toString() !== userId);
      user.joinedCommunities = user.joinedCommunities.filter(id => id.toString() !== communityId);

      await Promise.all([community.save(), user.save()]);

      console.log('Community left successfully');
      res.status(200).json({ message: 'Community left successfully', isJoined: false });
    } else {
      res.status(200).json({ message: 'User is not a member of this community', isJoined: false });
    }
  } catch (err) {
    console.error('Error leaving community:', err);
    res.status(500).send(err.message);
  }
}


const getJoinedCommunities = async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId).populate({
            path: 'joinedCommunities',
            select: '_id communityName communityPhoto',
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const joinedCommunities = await Promise.all(
            user.joinedCommunities.map(async (community) => {
                const memberCount = await Community.findById(community._id).select('users').then(c => c.users.length);
                return {
                    ...community.toObject(),
                    memberCount, 
                };
            })
        );

        res.status(200).json(joinedCommunities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getCommunityInfo = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching community info for:', communityId);

    const community = await Community.findById(communityId);
    if (!community) {
      console.log('Community not found:', communityId);
      return res.status(404).json({ message: "Community not found" });
    }

    community.populate('users', 'username profilePhoto');

    console.log('Community found:', community.name);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await Post.find({ communityId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username profilePhoto')
      .lean();

    console.log(`Fetched ${posts.length} posts`);

    const totalPosts = await Post.countDocuments({ communityId });

    const pagination = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    };

    console.log('Pagination:', pagination);

    res.status(200).json({ community, posts, pagination });
  } catch (error) {
    console.error("Error in getCommunityInfo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const getMyCommunities = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).populate({
      path: 'ownedCommunities',
      select: '_id communityName communityPhoto description',
    });

    if(user.ownedCommunities.length === 0){
      return res.status(200).json([]);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ownedCommunities = await Promise.all(
      user.ownedCommunities.map(async (community) => {
        const memberCount = await Community.findById(community._id).select('users').then(c => c.users.length);
        return {
          ...community.toObject(),
          memberCount, 
        };
      })
    );
    res.status(200).json(ownedCommunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const getTotalUserCommunitiesJoined = async (req, res) => {
  try {
    const { userId } = req.query; 
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const totalCommunitiesJoined = user.joinedCommunities.length;
    console.log(`Total communities joined by user ${userId}: ${totalCommunitiesJoined}`);
    res.status(200).json({ totalCommunitiesJoined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}




const getCommunitiesForExplore = async (req, res) => {
  try {
    const { userId } = req.query;

    console.log("Fetching communities for explore for user:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).populate('joinedCommunities');
    console.log("User:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interestedCategories = user.interestedCategories || [];
    const joinedCategories = user.joinedCommunities.map(community => community.category).filter(Boolean);

    console.log("Interested Categories:", interestedCategories);
    console.log("Joined Communities Categories:", joinedCategories);

    const categories = [...new Set([...interestedCategories, ...joinedCategories])];
    console.log("Combined Categories:", categories);

    const matchingCommunitiesCount = await Community.countDocuments({ category: { $in: categories } });
    console.log("Matching Communities Count:", matchingCommunitiesCount);

    const existingCategories = await Community.distinct('category');
    console.log("Existing Categories in Communities:", existingCategories);

    const communities = await Community.aggregate([
      {
        $match: {
          category: { $in: categories },
        },
      },
      {
        $project: {
          _id: 1,
          communityName: 1,
          communityPhoto: 1,
          description: 1,
          category: 1,
          memberCount: { $size: { $ifNull: ["$users", []] } },
        },
      },
      {
        $sort: {
          memberCount: -1,
        },
      },
      {
        $group: {
          _id: "$category",
          communities: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          category: "$_id",
          communities: { $slice: ["$communities", 0, 6] },
          _id: 0,
        },
      },
    ]);

    console.log("Aggregation result:", JSON.stringify(communities, null, 2));

    const result = communities.map((categoryData) => ({
      category: categoryData.category,
      communities: categoryData.communities.map((community) => ({
        ...community,
        memberCount: community.memberCount,
      })),
    }));

    console.log("Final result:", JSON.stringify(result, null, 2));

    res.status(200).json(result);
  } catch (err) {
    console.error("General error:", err);
    res.status(500).json({ error: err.message });
  }
};



const checkIfUserIsOwner = async (req, res) => {
  const { userId, communityId } = req.query;

  if (!userId || !communityId) {
    return res.status(400).json({ message: "User ID and community ID are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.ownedCommunities.includes(communityId)) {
      return res.status(200).json({ isOwner: true });
    } else {
      return res.status(200).json({ isOwner: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const removeUserFromCommunity = async (req, res) => {
  const { userId, communityId } = req.query;

  if (!userId || !communityId) {
    return res.status(400).json({ message: "User ID and community ID are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.users.includes(userId) && user.joinedCommunities.includes(communityId)) {
      community.users.pull(userId);
      user.joinedCommunities.pull(communityId);
      user.notifications.push({ message: `You have been removed from ${community.communityName}`, date: new Date() });
      await user.save();
      await community.save();
      return res.status(200).json({ message: "User removed from community successfully" });
    } else {
      return res.status(400).json({ message: "User is not a member of the community" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



const searchCommunities = async (req, res) => {
  try {
    function escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    }

    const searchValue = decodeURIComponent(req.query.searchValue || '');
    const escapedSearchValue = escapeRegex(searchValue);

    console.log('Escaped search value:', escapedSearchValue);

    const communities = await Community.find({
      communityName: { $regex: escapedSearchValue, $options: 'i' },
    }).select('_id communityName communityPhoto description');

    if (!communities || communities.length === 0) {
      return res.status(200).json([]); 
    }

    const searchedCommunities = await Promise.all(
      communities.map(async (community) => {
        const memberCount = await Community.findById(community._id)
          .select('users')
          .then((c) => c.users.length);
        return {
          ...community.toObject(),
          memberCount,
        };
      })
    );

    res.status(200).json(searchedCommunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export  {createCommunity, joinCommunity, leaveCommunity , getJoinedCommunities , getCommunityInfo, getMyCommunities,getTotalUserCommunitiesJoined , getCommunitiesForExplore ,checkIfUserIsOwner, removeUserFromCommunity , searchCommunities};