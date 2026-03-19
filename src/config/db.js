const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("DB connection failed:", err.message);

    setTimeout(() => {
      connectToDB();
    }, 5000);
  }
}

module.exports = connectToDB;