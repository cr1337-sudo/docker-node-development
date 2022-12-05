const express = require("express");
const mongoose = require("mongoose");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
} = require("./config/config");
const postRouter = require("./routes/post.routes");
const app = express();
const port = process.env.port || 3000;

const connectWithRetry = () => {
  mongoose
    .connect(
      `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}?authSource=admin`
    )
    // .connect("mongodb://cristian:123456@172.23.0.2:27017?authSource=admin",)
    .then(() => {
      console.log("Succesfully connected to DB");
      app.listen(port, () => {
        console.log(`App listening on port ${port}`);
      });
    })
    .catch((e) => {
      console.log(e);
      setTimeout(() => {
        connectWithRetry();
      }, 5000);
    });
};


app.use(express.json())

app.use("/api/v1/posts",postRouter)
app.get("/", (req, res) => {
  res.send("hola");
});

connectWithRetry();
