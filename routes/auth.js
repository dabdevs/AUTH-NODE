const app = require("express");
const router = app.Router();
const User = require("../models/User");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const schema = Joi.object({
  email: Joi.string().min(3).max(30).required().email(),
  username: Joi.string().min(3).max(15).required(),
  password: Joi.string().min(6).required(),
});

protectedRoutes = app.Router();

//Security middleware
protectedRoutes.use((req, res, next) => {
  const token = req.headers["access-token"];
  if (token) {
    jwt.verify(token, process.env.API_KEY, (err, decoded) => {
      if (err) {
        return res.json({ mensaje: "Invalid Token" });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.send({
      message: "Token not provided.",
    });
  }
});

//Get all models
router.get("/", protectedRoutes, (req, res) => {
  User.find()
    .then((users) => res.status(200).json({ users }))
    .catch((error) => res.status(404).json({ error }));
});

//Create a user
router.post("/register", (req, res) => {
  //Data validation
  const { error } = schema.validate(req.body);

  if (error) res.send(error.details[0].message);

  User.findOne({ email: req.body.email })
    .then((data) => {
      if (data !== null)
        res.status(200).json({ message: "User already exists" });
      else {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        const user = new User({
          ...req.body,
        });
        user
          .save()
          .then(() => res.json({ message: "User created" }))
          .catch((error) => res.json({ error }));
      }
    })
    .catch((error) => res.status(404).json({ error }));
});

//Get a user
router.get("/:id", protectedRoutes, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
});

//Update a user
router.put("/edit/:id", protectedRoutes, (req, res) => {
  //Data validation
  const { error } = schema.validate(req.body);

  if (error) res.send(error.details[0].message);

  User.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() =>
      res
        .status(200)
        .json({ message: `User with id ${req.params.id} modified.` })
    )
    .catch((error) => res.json({ error }));
});

//delete a user
router.delete("/:id", protectedRoutes, (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(() =>
      res
        .status(200)
        .json({ message: `User with id ${req.params.id} deleted.` })
    )
    .catch((error) => res.json({ error }));
});

//Api login
router.post("/login", (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (!user) return res.json({ message: "Authentication failed" });

      bcrypt.compare(req.body.password, user.password, (error, valid) => {
        if (error) return res.json({ error });
        if (valid) {
          playload = { check: true };
          const token = jwt.sign(playload, process.env.API_KEY, {
            expiresIn: 1000,
          });
          res.json({ token, message: "Login Successful" });
        }
      });
    })
    .catch((error) => res.json({ error }));
});

//Exporting modules
module.exports = router;
