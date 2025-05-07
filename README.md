# Social Media Platform

A full-stack social media platform that allows users to create, join, and interact within communities. Users can create posts, comment, reply, and engage with other members. The platform is built using modern web technologies, including React for the frontend and Node.js with Express for the backend, and MongoDB as the database.

---

## Features

### User Management
- User registration and login.
- Profile customization, including uploading profile pictures.
- View and manage user-specific posts, liked posts, and commented posts.

### Community Management
- Create, join, and leave communities.
- Manage users within a community (for community owners).
- Explore communities by category.

### Post Management
- Create posts with text and media.
- Edit and delete posts.
- View posts in communities and on the home feed.

### Interaction Features
- Like and unlike posts.
- Comment on posts and reply to comments.
- View and manage notifications for interactions.

---

## Tech Stack

### Frontend
- **Framework:** React (with Vite for development)
- **Styling:** CSS Modules, Mantine, and Material-UI
- **State Management:** React Hooks
- **Routing:** React Router DOM
- **HTTP Client:** Axios

### Backend
- **Framework:** Node.js with Express.js
- **Database:** MongoDB (Mongoose for ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer with Cloudinary integration

---

## Project Structure

### Client
The frontend code is located in the `client/` directory.
client/
### Client (`client/`)

```
client/
├── public/                 # Static assets
├── src/
    ├── assets/             # Images and other assets
    ├── components/         # Reusable React components
    ├── fonts/              # Custom fonts
    ├── pages/              # Page-level components
    ├── styles/             # Global styles
    ├── App.jsx             # Main application component
    └── main.jsx            # React entry point
├── package.json            # Frontend dependencies and scripts
└── vite.config.js          # Vite configuration
```

### Server
The backend code is located in the `server/` directory.
```
server/
├── controllers/ # Business logic for routes
├── models/ # Mongoose schemas and models
├── routes/ # API route definitions
├── server.js # Entry point for the backend
├── addUsers.js # Script to seed the database
├── .env # Environment variables
└── package.json # Backend dependencies and scripts
```


---

## Installation

### Prerequisites
- Node.js (v16 or later)
- MongoDB (local or cloud instance)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mustabass1r/social-media-platform.git
   cd social-media-platform

2. **Setup the backend:**
    ```bash
    cd server
    npm install
    cp .env.example .env
    # Update .env with your MongoDB connection string and other secrets
    npm run devStart

4. **Setup the frontend:**
    ```bash
    cd ../client
    npm install
    npm run dev

6. **Access the application:**  
    Open your browser and navigate to http://localhost:5173.

## API Endpoints
### User Routes
    POST /users/register - Register a new user.
    POST /users/login - Authenticate a user.
### Community Routes
    POST /communities/create - Create a new community.
    GET /communities/communityInfo/:id - Get details of a community.
    PATCH /communities/joinCommunity - Join a community.
    DELETE /communities/leaveCommunity - Leave a community.
### Post Routes
    POST /posts/createPost - Create a new post.
    GET /posts/myPosts - Get posts created by the user.
    GET /posts/myCommentedPosts - Get posts the user has commented on.
    ### Comment Routes
    POST /userPost/addComment - Add a comment to a post.
    POST /userPost/addReply - Add a reply to a comment.

## Environment Variables
The backend requires the following environment variables:  
```bash
    DATABASE_URL=<your-mongodb-connection-string>  
    CLOUDINARY_API_KEY=<your-cloudinary-api-key>  
    CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>  
    CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
```

## Scripts
### Backend
```bash
npm run devStart - Start the backend server with Nodemon.
```
### Frontend
```bash
npm run dev - Start the development server.
npm run build - Build the frontend for production.
npm run preview - Preview the production build.
```

## Acknowledgments
 - React  
 - Node.js  
 - MongoDB  
 - Material-UI  
 - Cloudinary  
