const Topic = require("../models/Topic");
const ModeratorApplication = require("../models/ModeratorApplication");
const authService = require("../services/authorizationService");

exports.createModeratorApplication = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { motivation, experience, availability } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    const isModerator = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );
    if (isModerator) {
      return res
        .status(400)
        .json({ message: "Jesteś już moderatorem tego tematu." });
    }

    const existingApp = await ModeratorApplication.findOne({
      topic: topicId,
      applicant: req.user._id,
      status: "pending",
    });

    if (existingApp) {
      return res.status(400).json({
        message: "Masz już oczekującą aplikację na moderatora tego tematu.",
      });
    }

    const application = await ModeratorApplication.create({
      topic: topicId,
      applicant: req.user._id,
      motivation,
      experience: experience || "",
      availability: availability || "moderate",
    });

    res.status(201).json({
      status: "success",
      message: "Aplikacja została wysłana pomyślnie.",
      data: { application },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getModeratorApplications = async (req, res) => {
  try {
    const { topicId } = req.params;

    const hasPerm = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );
    if (!hasPerm) {
      return res.status(403).json({ message: "Brak uprawnień." });
    }

    const applications = await ModeratorApplication.find({
      topic: topicId,
    })
      .populate("applicant", "username email")
      .populate("reviewedBy", "username")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: applications.length,
      data: { applications },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewModeratorApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status musi być 'approved' lub 'rejected'.",
      });
    }

    const application = await ModeratorApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Aplikacja nie znaleziona." });
    }

    const hasPerm = await authService.canManageTopic(
      req.user._id,
      application.topic,
      req.user.role,
    );
    if (!hasPerm) {
      return res.status(403).json({ message: "Brak uprawnień." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "Ta aplikacja została już rozpatrzona.",
      });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = Date.now();
    application.reviewNotes = reviewNotes || "";

    await application.save();

    if (status === "approved") {
      const topic = await Topic.findById(application.topic);

      const alreadyMod = topic.moderators.some(
        (m) => m.user.toString() === application.applicant.toString(),
      );

      if (!alreadyMod) {
        topic.moderators.push({
          user: application.applicant,
          promotedBy: req.user._id,
        });
        await topic.save();

        await moderatorToSubtopics(
          application.topic,
          application.applicant,
          req.user._id,
        );
      }
    }

    res.status(200).json({
      status: "success",
      message: `Aplikacja została ${status === "approved" ? "zaakceptowana" : "odrzucona"}.`,
      data: { application },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
