const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Invite = require('../models/PendingInvite');
const Repository = require('../models/Repository');
const User = require('../models/User'); 
const {addCollaborator}=require('../controllers/teamController');

router.post('/collaborators', auth, addCollaborator);

module.exports = router;