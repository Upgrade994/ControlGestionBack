const db = require("../models");
const ROLES = db.ROLES; // Assuming ROLES is a constant array of allowed roles
const User = db.user;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Username
    const existingUsername = await User.findOne({ username: req.body.username });
    if (existingUsername) {
      return res.status(400).send({ message: "Failed! Username is already in use!" });
    }

    // Email
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next();
  } catch (err) {
    console.error("Error checking duplicate username or email:", err);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};

const checkRolesExisted = async (req, res, next) => {
  if (req.body.roles) {
    const roles = req.body.roles;
    for (const role of roles) {
      if (!ROLES.includes(role)) {
        return res.status(400).send({ message: `Failed! Role ${role} does not exist!` });
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;