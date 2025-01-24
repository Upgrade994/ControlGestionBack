const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  try {
    const decoded = await jwt.verify(token, config.secret);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(401).send({ message: "Unauthorized!" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const roles = await Role.find({ _id: { $in: user.roles } });
    if (!roles) {
      return res.status(500).send({ message: "Error finding user roles!" });
    }

    for (const role of roles) {
      if (role.name === "admin") {
        next();
        return;
      }
    }

    return res.status(403).send({ message: "Require Admin Role!" });
  } catch (err) {
    console.error("Error checking admin role:", err);
    return res.status(500).send({ message: "Internal Server Error!" });
  }
};

const isModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const roles = await Role.find({ _id: { $in: user.roles } });
    if (!roles) {
      return res.status(500).send({ message: "Error finding user roles!" });
    }

    for (const role of roles) {
      if (role.name === "moderator") {
        next();
        return;
      }
    }

    return res.status(403).send({ message: "Require Moderator Role!" });
  } catch (err) {
    console.error("Error checking moderator role:", err);
    return res.status(500).send({ message: "Internal Server Error!" });
  }
};

const isLinker = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const roles = await Role.find({ _id: { $in: user.roles } });
    if (!roles) {
      return res.status(500).send({ message: "Error finding user roles!" });
    }

    for (const role of roles) {
      if (role.name === "linker") {
        next();
        return;
      }
    }

    return res.status(403).send({ message: "Require Linker Role!" });
  } catch (err) {
    console.error("Error checking linker role:", err);
    return res.status(500).send({ message: "Internal Server Error!" });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  isLinker
};

module.exports = authJwt;