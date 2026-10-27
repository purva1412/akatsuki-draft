const Post = require("../models/Post");

/**
 * @desc    Get all pending posts for admin review
 * @route   GET /admin/posts/pending
 * @access  Protected + Admin
 */
const getPendingPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a pending post
 * @route   PATCH /admin/posts/approve/:id
 * @access  Protected + Admin
 */
const approvePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a post with status '${post.status}'. Only pending posts can be approved.`,
      });
    }

    post.status = "approved";
    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post approved successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending post
 * @route   PATCH /admin/posts/reject/:id
 * @access  Protected + Admin
 */
const rejectPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a post with status '${post.status}'. Only pending posts can be rejected.`,
      });
    }

    post.status = "rejected";
    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post rejected successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingPosts, approvePost, rejectPost };
