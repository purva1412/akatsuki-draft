const Post = require("../models/Post");

/**
 * @desc    Create a new post
 * @route   POST /posts
 * @access  Protected
 */
const createPost = async (req, res, next) => {
  try {
    const { title, description, content, image, category, status } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, content, and category.",
      });
    }

    // Only allow 'draft' or 'pending' on creation
    let postStatus = "draft";
    if (status === "pending") {
      postStatus = "pending";
    }

    const post = await Post.create({
      title,
      description,
      content,
      image: image || "",
      category,
      createdBy: req.user._id,
      status: postStatus,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all approved posts (public feed)
 * @route   GET /posts
 * @access  Public
 */
const getApprovedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "approved" })
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
 * @desc    Get single approved post by ID
 * @route   GET /posts/:id
 * @access  Public
 */
const getApprovedPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Post not found or not yet approved.",
      });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all posts created by the logged-in user (any status)
 * @route   GET /posts/my-posts
 * @access  Protected
 */
const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id })
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
 * @desc    Update a post (owner only)
 * @route   PATCH /posts/:id
 * @access  Protected
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Verify ownership
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this post.",
      });
    }

    const { title, description, content, image, category, status } = req.body;

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (category !== undefined) post.category = category;
    if (status !== undefined) post.status = status;

    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a post (owner only)
 * @route   DELETE /posts/:id
 * @access  Protected
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Verify ownership
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post.",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
