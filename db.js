require("./db");

const mongoose = require("mongoose");

const connection = mongoose.connect(
  "mongodb+srv://sta_soc:cGk4PmaJDT09kq2J@hw03-mongodb-cluster.8z2pqii.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

connection.on("error", (err) => {
  console.error("Database connection error:", err);
  process.exit(1);
});

connection.once("open", () => {
  console.log("Database connection successful");
});

module.exports = connection;
