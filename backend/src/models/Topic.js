const mongoose = require("mongoose");
const User = require("./User");

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Temat musi mieć nazwę"],
      trim: true,
      maxLength: 150,
    },
    description: {
      type: String,
      required: [true, "Opis nie może być pusty"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    moderators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        promotedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        promotedAt: { type: Date, default: Date.now },
      },
    ],
    blockedUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        blockedAt: { type: Date, default: Date.now },
        reason: String,
        allowedSubtopics: [
          { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
        ],
      },
    ],
    isClosed: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true },
);

topicSchema.index({ name: 1, parent: 1 }, { unique: true });

module.exports = mongoose.model("Topic", topicSchema);
