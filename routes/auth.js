const app = require("express");
const router = app.Router();
const User = require("../models/User");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Validating the registration data with Joi
const registerSchema = Joi.object({
  email: Joi.string().min(3).max(30).required().email(),
  username: Joi.string().min(3).max(15).required(),
  password: Joi.string().min(6).required(),
});

//Validating the login data with Joi
const loginSchema = Joi.object({
  email: Joi.string().min(3).max(30).required().email(),
  password: Joi.string().required(),
});

//Protected routes
protectedRoutes = app.Router();

//Security middleware
protectedRoutes.use((req, res, next) => {
  const token = req.headers["access-token"];
  if (token) {
    //verifying the access token
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

//Get all users
router.get("/", (req, res) => {
  User.find()
    .then((users) => res.status(200).json({ users }))
    .catch((error) =>
      res.status(404).json({ message: "No users found!", error: error })
    );
});

//Api login
router.post("/login", (req, res) => {
  //Data validation
  const { error } = loginSchema.validate(req.body);
  if (error) res.send(error.details[0].message);

  //Retreiving user
  User.findOne({ email: req.body.email }).then((user) => {
    //If the user does not exist
    if (user == null)
      return res.status(404).json({ message: "Authentication failed" });

    //Validating password
    bcrypt.compare(req.body.password, user.password).then(function (valid) {
      //If the password is not valid
      if (!valid) return res.send({ message: "Wrong credentials" });

      //Creating javascript web token
      playload = { check: true };
      const token = jwt.sign(playload, process.env.API_KEY, {
        expiresIn: 1000,
      });
      res.json({ token, message: "Login Successful" });
    });
  });
});

//Create a user
router.post("/register", (req, res) => {
  //Data validation
  const { error } = registerSchema.validate(req.body);

  if (error) res.send(error.details[0].message);

  User.findOne({ email: req.body.email })
    .then((data) => {
      if (data !== null)
        return res.status(200).json({ message: "User already exists" });

      //Hashing password
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        // Saving hashed password to DB.
        if (err) return res.json({ err });
        const user = new User({
          ...req.body,
        });

        //Saving hashed pawwsword
        user.password = hash;
        user
          .save()
          .then(() => res.json({ message: "User created" }))
          .catch((error) => res.json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
});

//Get a user
router.get("/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((user) => res.status(200).json(user))
    .catch((error) =>
      res.status(404).json({ message: "User cannot be found.", error })
    );
});

//Update a user
router.put("/edit/:id", protectedRoutes, (req, res) => {
  User.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() =>
      res
        .status(200)
        .json({ message: `User with id ${req.params.id} modified.` })
    )
    .catch((error) => res.json({ message: "User cannot be found.", error }));
});

//Delete a user
router.delete("/:id", protectedRoutes, (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(() =>
      res
        .status(200)
        .json({ message: `User with id ${req.params.id} deleted.` })
    )
    .catch((error) => res.json({ message: "User cannot be found.", error }));
});

//Exporting modules
module.exports = router;
