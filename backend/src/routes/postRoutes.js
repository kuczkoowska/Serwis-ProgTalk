const express = require("express");
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", postController.createPost);
router.get("/topic/:topicId", postController.getPostsByTopic);
router.patch("/:postId/like", postController.toggleLike);
router.delete("/:postId", postController.deleteOwnPost);
router.get("/:postId/page", postController.getPostPage);

module.exports = router;
