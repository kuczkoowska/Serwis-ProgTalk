const express = require("express");
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", postController.createPost);
router.get("/topic/:topicId", postController.getTopicPosts);

module.exports = router;
