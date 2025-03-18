const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// File upload route
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
