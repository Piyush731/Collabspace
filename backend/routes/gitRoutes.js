const express = require('express');
const router = express.Router();
const gitController = require('../controllers/gitController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Branch operations
router.get('/:repoId/branches', gitController.getBranches);
router.post('/:repoId/branches', gitController.createBranch);
router.post('/:repoId/switch-branch', gitController.switchBranch);

// Merge operations
router.post('/:repoId/merge', gitController.mergeBranches);
router.get('/:repoId/conflicts', gitController.getConflicts);
router.post('/:repoId/resolve-conflict', gitController.resolveConflict);

// Commit and push operations
router.post('/:repoId/commit', gitController.commitChanges);
router.post('/:repoId/push', gitController.pushChanges);

// Delete branch (branch name may contain slashes)
router.delete('/:repoId/branches/:branch(*)', gitController.deleteBranch);
// Also PATCH delete route supports wildcard
router.patch('/:repoId/branches/:branch(*)', gitController.deleteBranch);

// Pull Request operations
router.get('/:repoId/pulls', gitController.listPulls);
router.post('/:repoId/pulls', gitController.createPull);
router.get('/:repoId/pulls/:prNumber/conflicts', gitController.getPullConflicts);
router.delete('/:repoId/pulls/:prNumber', gitController.deletePull);
router.patch('/:repoId/pulls/:prNumber', gitController.deletePull);

module.exports = router; 