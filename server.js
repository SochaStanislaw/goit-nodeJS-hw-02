const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(
    "mongodb+srv://sta_soc:cGk4PmaJDT09kq2J@hw03-mongodb-cluster.8z2pqii.mongodb.net/db-contacts",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
