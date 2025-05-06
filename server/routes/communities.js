import express from 'express'
import { createCommunity , joinCommunity, leaveCommunity , getJoinedCommunities , getCommunityInfo, getMyCommunities , getTotalUserCommunitiesJoined , getCommunitiesForExplore , checkIfUserIsOwner , removeUserFromCommunity,searchCommunities} from "../controllers/communityController.js";


const router = express.Router();


router.post('/create' , createCommunity);

router.patch('/joinCommunity',joinCommunity);

router.delete('/leaveCommunity',leaveCommunity);

router.get('/joinedCommunities',getJoinedCommunities);

router.get('/communityInfo/:communityId', getCommunityInfo);

router.get('/myCommunities', getMyCommunities);

router.get('/totalUserCommunitiesJoined', getTotalUserCommunitiesJoined);

router.get('/explore' , getCommunitiesForExplore); 

router.get('/checkIfUserIsOwner' , checkIfUserIsOwner);

router.delete('/removeUserFromCommunity' , removeUserFromCommunity);

router.get('/search' , searchCommunities);




export default router;