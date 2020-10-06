const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const userRoutes = require("./routes/auth");

const app = express();

app.use(morgan("dev"));
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));
dotenv.config();

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database!"))
  .catch(() =>
    console.log("An error ocurred while connecting to the database!")
  );

app.use(bodyParser.json());

app.use("/api/users", userRoutes);

//400 middleware
app.use((req, res) => {
  res.status(400).send({ message: "Bad request" });
});

//Exporting the module
module.exports = app;
