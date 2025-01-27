const mongoose = require("mongoose");

const Areas = mongoose.model(
    "Areas",
    new mongoose.Schema({
        area: String
    })
);

module.exports = Areas;