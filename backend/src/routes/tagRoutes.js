const express = require("express");
const tagController = require("../controllers/tagController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/", tagController.getAllTags);
router.post("/", tagController.createTag);
router.get("/topic/:topicId", tagController.getTagsForTopic);
router.post("/assign", tagController.addTagToTopic);
router.post("/remove", tagController.removeTagFromTopic);
router.delete("/:tagId", tagController.deleteTag);

module.exports = router;
