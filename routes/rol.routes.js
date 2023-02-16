const roleController = require("../controllers/rol.controller");

module.exports = function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/roles", roleController.getRoles);
    app.get("/api/admin-roles", roleController.getAdminRoles);
};