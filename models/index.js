const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.models");
db.role = require("./role.models");
db.area = require("./area.models");
db.institution = require("./institution.models");
db.instrument = require("./instrument.models");

db.ROLES = ["user", "admin", "moderator", "linker"];

module.exports = db;