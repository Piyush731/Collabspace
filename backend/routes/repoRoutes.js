const express = require('express');
const router = express.Router(); 
const Repository = require('../models/Repository'); // Add this
const User = require('../models/User'); // Add this
const axios = require('axios'); // Add this
const {createRepository, getRepository, getUserRepositories, createFile, createDirectory, getRepoContents, getRecursiveContents, deleteFile} = require('../controllers/repoController');
const {pushChanges, pullChanges, commitChanges} = require('../controllers/repoController');
const verifyToken = require('../middleware/auth'); 

router.post('/', verifyToken, createRepository); //create 
router.get('/my-repos', verifyToken, getUserRepositories); //get user repo
router.get('/:id', verifyToken, getRepository); //get  
router.get('/:repoId/contents',verifyToken, getRepoContents);
router.get('/:repoId/contents/recursive',verifyToken, getRecursiveContents);
router.post('/:repoId/create-file', verifyToken, createFile);
router.post('/:repoId/create-directory', verifyToken, createDirectory);
router.post('/:repoId/delete-file', verifyToken, deleteFile);
router.post('/:repoId/sync-collaborators', verifyToken, syncCollaborators);

//router.patch('/repos/:id', auth, async (req, res)   future implementations
//router.delete('/repos/:id', auth, async (req, res) 
router.get('/:repoId/files/*', verifyToken, async (req, res) => {
  try {
    const filePath = req.params[0];
    const repo = await Repository.findById(req.params.repoId);
    const owner = await User.findById(repo.owner);
    const encodedPath = filePath === '' ? '' : 
    filePath.split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
    const response = await axios.get(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${encodedPath}?ref=${req.query.ref || 'main'}`,
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );

    res.json({
      content: response.data.content,
      sha: response.data.sha
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

module.exports = router;