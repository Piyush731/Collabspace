// backend/routes/board.routes.js
const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { verifyRepoAccess } = require('../middleware/repoPermissions');

router.get('/:repoId/board', verifyRepoAccess, boardController.getBoard);
router.post('/:repoId/board', verifyRepoAccess, boardController.createBoard);
router.put('/:repoId/board/columns', verifyRepoAccess, boardController.updateColumns);
router.post('/:repoId/board/sync-gitea', verifyRepoAccess, boardController.syncWithGitea);

module.exports = router;