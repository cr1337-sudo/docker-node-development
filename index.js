const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.port || 3000;

mongoose
  // .connect("mongodb://cristian:123456@mongo:27017?authSource=admin",)
  .connect("mongodb://cristian:123456@172.23.0.2:27017?authSource=admin",)
  .then(() => {
    console.log("Succesfully connected to DB");
  })
  .catch((e) => {
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("hola");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
