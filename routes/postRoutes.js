const express = require("express");
const router = express.Router();
const {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Protected routes (must come before /:id to avoid "my-posts" matching as an id)
router.get("/my-posts", verifyToken, getMyPosts);
router.post("/", verifyToken, createPost);
router.patch("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

// Public routes
router.get("/", getApprovedPosts);
router.get("/:id", getApprovedPostById);

module.exports = router;
