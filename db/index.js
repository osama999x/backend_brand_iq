const mongoose = require("mongoose");

console.log("DATABASE: ", process.env.DATABASE);
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("Database is connected.");
  })
  .catch((err) => {
    console.log(err);
  });
