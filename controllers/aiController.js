const Post = require("../models/Post");
const ai = require("../config/gemini");

/**
 * @desc    Improve a post's content using Google Gemini AI
 * @route   POST /ai/improve/:postId
 * @access  Protected
 */
const improvePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const originalPost = await Post.findById(postId);

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Verify ownership
    if (originalPost.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to improve this post.",
      });
    }

    const prompt =
      "Refine, format, and enhance the following article content for clarity, grammar, and readability while preserving its core intent and tone: \n\n" +
      originalPost.content;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const improvedContent = response.text;

    if (!improvedContent) {
      return res.status(500).json({
        success: false,
        message: "AI did not return any content. Please try again.",
      });
    }

    // Create a brand-new draft with the improved content
    const newDraft = await Post.create({
      title: originalPost.title + " (AI Improved)",
      description: originalPost.description,
      content: improvedContent,
      image: originalPost.image,
      category: originalPost.category,
      createdBy: req.user._id,
      status: "draft",
    });

    res.status(201).json({
      success: true,
      message: "Draft improved successfully",
      newDraft,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { improvePost };
