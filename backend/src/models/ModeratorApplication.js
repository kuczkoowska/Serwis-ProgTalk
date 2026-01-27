const mongoose = require("mongoose");

const moderatorApplicationSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    motivation: {
      type: String,
      required: [true, "Motywacja jest wymagana"],
      minLength: 50,
    },
    experience: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      enum: ["occasional", "moderate", "daily", "frequent"],
      default: "moderate",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

moderatorApplicationSchema.index({ topic: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model(
  "ModeratorApplication",
  moderatorApplicationSchema,
);
