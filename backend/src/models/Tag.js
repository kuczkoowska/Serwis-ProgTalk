const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    color: {
      type: String,
      default: "#3498db",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
  },
  { timestamps: true },
);

tagSchema.index({ name: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);
