const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

const Outputs = mongoose.model();

module.exports = Outputs;