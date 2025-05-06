import { Router } from "express"; 
import {createUser , loginUser, changeProfilePhoto , getUserEmail , changeUsername , changePassword ,getUserNotifications} from '../controllers/userController.js' 


const router = Router();

router.post('/signup',createUser);

router.post('/login',loginUser);

router.patch('/changeProfilePhoto',changeProfilePhoto);

router.get('/getUserEmail',getUserEmail);

router.patch('/changeUsername',changeUsername); 

router.patch('/changePassword',changePassword);

router.get('/userNotifications',getUserNotifications);

export default router;