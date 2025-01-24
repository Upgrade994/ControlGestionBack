const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const mongoose = require('mongoose'); // Import mongoose for casting ObjectIds

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    // Validate request body
    if (!req.body.name || !req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Please fill in all required fields!" });
    }

    // Check for existing username
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).send({ message: "Username is already in use!" });
    }

    // Create a new User object
    const user = new User({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      area: req.body.area,
      password: bcrypt.hashSync(req.body.password, 8)
    });

    // Assign roles (if provided)
    if (req.body.roles) {
      const roles = await Role.find({
        name: { $in: req.body.roles }
      });

      if (!roles.length) {
        return res.status(400).send({ message: "Failed to find specified roles!" });
      }

      const roleIds = roles.map(role => mongoose.Types.ObjectId(role._id)); // Cast to ObjectIds
      user.roles = roleIds;
    } else {
      // Assign default role (e.g., "user")
      const defaultRole = await Role.findOne({ name: "user" });
      if (!defaultRole) {
        return res.status(500).send({ message: "Failed to find default role!" });
      }
      user.roles = [defaultRole._id];
    }

    // Save the User
    const savedUser = await user.save();
    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    // Validate username
    if (!req.body.username) {
      return res.status(400).send({ message: "Username is required!" });
    }

    // Find user by username
    const user = await User.findOne({ username: req.body.username }).populate("roles", "-__v");
    if (!user) {
      return res.status(401).send({ message: "Invalid username or password!" });
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid username or password!" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // 24 hours
    });

    // Extract roles (formatted as authorities)
    const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

    // Respond with user data and token
    res.status(200).send({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      area: user.area,
      roles: authorities,
      accessToken: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};