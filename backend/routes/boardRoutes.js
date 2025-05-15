// backend/routes/board.routes.js
const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { verifyTaskAccess } = require('../middleware/taskPermissions');

router.get('/:repoId/board', verifyTaskAccess, boardController.getBoard);
router.put('/:repoId/board/columns', verifyTaskAccess, boardController.updateColumns);
router.post('/:repoId/board/sync-gitea', verifyTaskAccess, boardController.syncWithGitea);

module.exports = router;