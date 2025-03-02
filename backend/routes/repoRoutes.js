const express = require('express');
const router = express.Router(); 
const {createRepository, getRepository, getUserRepositories, createFile, createDirectory, getRepoContents} = require('../controllers/repoController');
const verifyToken = require('../middleware/auth'); 

router.post('/', verifyToken, createRepository); //create 
router.get('/my-repos', verifyToken, getUserRepositories); //get user repo
router.get('/:id', verifyToken, getRepository); //get 
//router.patch('/repos/:id', auth, async (req, res)   future implementations
//router.delete('/repos/:id', auth, async (req, res)
// Add these routes
router.post('/:repoId/files', verifyToken, createFile);
router.post('/:repoId/directories', verifyToken, createDirectory);
router.get('/:repoId/contents', verifyToken, getRepoContents);

module.exports = router;