const express = require("express");
const Repository = require("../models/Repository");
const simpleGit = require("simple-git");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");

router.use(authenticateUser);
//create new repository
router.post("/create", async (req, res) => {
  const { name } = req.body; // Get repository name from request
  const userId = req.user.id; // Extract user ID from authenticated request
  const repoPath = path.join(__dirname, `../../repositories/${userId}/${name}`); // Path for repository creation

  try {
    // Check if repository already exists
    if (fs.existsSync(repoPath)) {
      return res.status(400).json({ error: "Repository already exists" });
    }

    // Initialize repository directory
    fs.mkdirSync(repoPath, { recursive: true });
    const git = simpleGit(repoPath);
    await git.init(); // Initialize Git repository

    // Save repository details in MongoDB
    const newRepository = new Repository({
      userId,
      name,
      path: repoPath,
    });

    await newRepository.save();

    res.status(201).json({
      message: "Repository created successfully",
      repository: newRepository,
    });
  } catch (error) {
    console.error("Error creating repository", error);
    res.status(500).json({ error: "Failed to create repository" });
  }
});
// Get user repositories
router.get("/", async (req, res) => {
  const userId = req.user.id; // Assume authentication middleware sets req.user
  const repositories = await Repository.find({ userId });
  res.json(repositories);
});

// Get repository details
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const repository = await Repository.findById(id);
  res.json(repository);
});

// Commit changes
router.post("/:id/commit", async (req, res) => {
  const { message } = req.body;
  const git = simpleGit();

  try {
    await git.add("./*"); // Add all changes
    await git.commit(message); // Commit with the provided message
    res.json({ message: "Commit successful!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to commit changes" });
  }
});

// Push changes
router.post("/:id/push", async (req, res) => {
  const git = simpleGit();

  try {
    await git.push("origin", "main"); // Push to the main branch
    res.json({ message: "Push successful!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to push changes" });
  }
});

// Pull changes
router.post("/:id/pull", async (req, res) => {
  const git = simpleGit();

  try {
    await git.pull("origin", "main"); // Pull the latest changes
    res.json({ message: "Pull successful!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to pull changes" });
  }
});

module.exports = router;
