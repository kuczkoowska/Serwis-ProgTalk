const express = require("express");
const topicController = require("../controllers/topicController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", topicController.createTopic); // Tworzenie
router.get("/", topicController.getAllTopics); // Lista
router.get("/:id", topicController.getTopicDetails); // Szczegóły + podtematy

module.exports = router;
