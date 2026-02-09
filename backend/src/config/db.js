const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Połączono z MongoDB");
  } catch (err) {
    console.error("Błąd połączenia z bazą:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
