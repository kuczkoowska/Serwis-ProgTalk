const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  color: {
    type: String,
    default: "#3498db",
  },
});

module.exports = mongoose.model("Tag", tagSchema);
