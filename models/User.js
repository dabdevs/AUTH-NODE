const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    min: 4,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
