import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

// Model definitions (unchanged)
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  accountCreated: Date,
  profilePhoto: String,
  ownedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  likedPost: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  repliedPost: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  seenPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}));

const Community = mongoose.model('Community', new mongoose.Schema({
  communityName: String,
  communityPhoto: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: Date,
  category: String,
}));

const Post = mongoose.model('Post', new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: Number,
  description: String,
  media: String,
  uploadTime: Date,
}));

const Comment = mongoose.model('Comment', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  text: String,
  likes: Number,
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    text: String,
    createdAt: Date,
    likes: Number,
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  createdAt: Date,
}));

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/WebProjectTest');
console.log('Connected to MongoDB');

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Verification helper function
async function verifyReference(modelName, id, refModelName, refField) {
  const Model = mongoose.model(modelName);
  const RefModel = mongoose.model(refModelName);
  const doc = await Model.findById(id);
  if (!doc) {
    console.error(`Error: ${modelName} with ID ${id} not found`);
    return false;
  }
  const refDoc = await RefModel.findById(doc[refField]);
  if (!refDoc) {
    console.error(`Error: ${refModelName} reference in ${modelName}.${refField} (ID: ${doc[refField]}) not found`);
    return false;
  }
  console.log(`Verified: ${modelName} ${id} references ${refModelName} ${refDoc._id}`);
  return true;
}

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Community.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Existing data cleared');

    // Create users
    const users = [];
    for (let i = 0; i < 5; i++) {
      const user = new User({
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: 'password123',
        accountCreated: faker.date.past(),
        profilePhoto: faker.image.avatar(),
      });
      users.push(await user.save());
      console.log(`User created with ID: ${user._id}`);
    }

    // Create communities
    const categories = ['Technology', 'Food', 'Movies and Shows', 'News', 'Vehicles'];
    const communities = [];
    for (const category of categories) {
      const owner = getRandomItem(users);
      const community = new Community({
        communityName: `${category} Enthusiasts`,
        communityPhoto: faker.image.url(),
        category: category,
        users: users.map(user => user._id),
        createdAt: faker.date.past(),
      });
      communities.push(await community.save());
      console.log(`Community created with ID: ${community._id}`);

      owner.ownedCommunities.push(community._id);
      await owner.save();
    }

    // Update users with joined communities
    for (const user of users) {
      user.joinedCommunities = communities.map(community => community._id);
      await user.save();
    }

    // Create posts
    const posts = [];
    for (const community of communities) {
      for (let i = 0; i < 10; i++) {
        const user = getRandomItem(users);
        const post = new Post({
          communityId: community._id,
          userId: user._id,
          description: faker.lorem.paragraph(),
          media: faker.image.url(),
          uploadTime: faker.date.recent(),
          likes: 0,
        });
        const savedPost = await post.save();
        posts.push(savedPost);
        console.log(`Post created with ID: ${savedPost._id}, User ID: ${savedPost.userId}, Community ID: ${savedPost.communityId}`);

        user.posts.push(savedPost._id);
        await user.save();

        community.posts.push(savedPost._id);
        await community.save();

        // Add post to seenPosts for some users
        const seenByUsers = faker.helpers.shuffle(users).slice(0, Math.floor(Math.random() * users.length));
        for (const seenByUser of seenByUsers) {
          seenByUser.seenPosts.push(savedPost._id);
          await seenByUser.save();
        }
      }
    }

    // Create comments and replies
    for (const post of posts) {
      for (let i = 0; i < 5; i++) {
        const user = getRandomItem(users);
        const comment = new Comment({
          userId: user._id,
          postId: post._id,
          text: faker.lorem.sentence(),
          createdAt: faker.date.recent(),
          likes: 0,
        });

        // Create replies
        for (let j = 0; j < 3; j++) {
          const replyUser = getRandomItem(users);
          comment.replies.push({
            userId: replyUser._id,
            postId: post._id,
            text: faker.lorem.sentence(),
            createdAt: faker.date.recent(),
            likes: 0,
          });

          replyUser.repliedPost.push(comment._id);
          await replyUser.save();
        }

        const savedComment = await comment.save();
        console.log(`Comment created with ID: ${savedComment._id}, User ID: ${savedComment.userId}, Post ID: ${savedComment.postId}`);

        post.comments.push(savedComment._id);
        await post.save();

        user.comments.push(savedComment._id);
        await user.save();
      }
    }

    // Add likes to posts
    for (const post of posts) {
      const likesCount = Math.floor(Math.random() * 20);
      const likers = faker.helpers.shuffle(users).slice(0, likesCount);
      post.likedBy = likers.map(user => user._id);
      post.likes = likers.length;
      await post.save();

      for (const liker of likers) {
        liker.likedPost.push(post._id);
        await liker.save();
      }
    }

    // Add likes to comments
    const comments = await Comment.find();
    for (const comment of comments) {
      const likesCount = Math.floor(Math.random() * 10);
      const likers = faker.helpers.shuffle(users).slice(0, likesCount);
      comment.likedBy = likers.map(user => user._id);
      comment.likes = likers.length;
      await comment.save();
    }

    console.log('Database seeded successfully');

    // Verify references
    console.log('\nVerifying references:');
    for (const post of posts) {
      await verifyReference('Post', post._id, 'User', 'userId');
      await verifyReference('Post', post._id, 'Community', 'communityId');
    }

    for (const comment of comments) {
      await verifyReference('Comment', comment._id, 'User', 'userId');
      await verifyReference('Comment', comment._id, 'Post', 'postId');
    }

    for (const user of users) {
      for (const postId of user.posts) {
        await verifyReference('User', user._id, 'Post', 'posts');
      }
      for (const communityId of user.joinedCommunities) {
        await verifyReference('User', user._id, 'Community', 'joinedCommunities');
      }
    }

    for (const community of communities) {
      for (const userId of community.users) {
        await verifyReference('Community', community._id, 'User', 'users');
      }
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

await seedDatabase();

