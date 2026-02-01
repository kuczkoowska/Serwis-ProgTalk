const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/progtalk");
    console.log("Połączono z MongoDB");
  } catch (err) {
    console.error("Błąd połączenia z bazą:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
