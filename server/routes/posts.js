    import { Router } from "express";
    import { createPost , getMyPosts , getMyLikedPosts , getMyCommentedPosts , deletePost, deleteComment , searchPosts} from '../controllers/postController.js';

    const router = Router();

    router.post('/createPost', createPost);

    router.get('/myPosts', getMyPosts);

    router.get('/myLikedPosts' , getMyLikedPosts);

    router.get('/myCommentedPosts' , getMyCommentedPosts);

    router.delete('/deletePost' , deletePost);

    router.delete('/deleteComment' , deleteComment);

    router.get('/search' , searchPosts);





    export default router;

