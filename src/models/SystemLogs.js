const mongoose = require("mongoose");
const { ACTION_TYPES } = require("../utils/constants/actionTypes");

const systemLogSchema = new mongoose.Schema(
  {
    performer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    performerEmailSnapshot: {
      // na nieudane logowanie
      type: String,
    },
    actionType: {
      type: String,
      enum: Object.values(ACTION_TYPES),
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActionLog", actionLogSchema);
