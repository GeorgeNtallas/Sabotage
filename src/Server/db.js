const mongoose = require("mongoose");
const Room = require("./Models/Room");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not set");
  }
  // Mongoose >=6 uses sensible defaults; do not pass deprecated options.
  return mongoose.connect(process.env.MONGODB_URI);
}

module.exports = { connectDB, Room };
