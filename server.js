const mongoose = require("mongoose");
const app = require("./app.js");
const fs = require("fs");
require("dotenv").config();

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");

      // create tmp folder
      if (!fs.existsSync("tmp")) {
        console.log("tmp folder created");
        fs.mkdirSync("tmp");
      }
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// signs on which tmp folder is deleted
// ctrl + C
process.on("SIGINT", tmpDelete);

// delete tmp foder func
function tmpDelete() {
  try {
    if (fs.existsSync("tmp")) {
      fs.rmdirSync("tmp");
      console.log("tmp folder deleted");
    }
  } catch (err) {
    console.error("error to delete tmp folder:", err);
  }
  process.exit();
}
