const express = require("express");
const router = express.Router();
const {
  getPendingPosts,
  approvePost,
  rejectPost,
} = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// All admin routes require authentication + admin role
router.use(verifyToken, isAdmin);

router.get("/posts/pending", getPendingPosts);
router.patch("/posts/approve/:id", approvePost);
router.patch("/posts/reject/:id", rejectPost);

module.exports = router;
