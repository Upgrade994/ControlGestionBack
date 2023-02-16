const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    area: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  },{
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
  },
  })
);

module.exports = User;