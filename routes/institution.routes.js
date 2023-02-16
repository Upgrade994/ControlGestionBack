const express = require("express");
const institutionController = require("../controllers/institution.controller");

module.exports = function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/institutions", institutionController.getAllInstitution);
    app.get("/api/institution/:id", institutionController.getInstitution);
    app.put("/api/institution/update/:id", institutionController.updateInstitution);
    app.put("/api/institutions/updates/:id", institutionController.updateManyInstitutions);
    app.post("/api/institution/save", institutionController.saveInstitution);
    app.post("/api/institutions/saves/:id", institutionController.saveManyInstitutions);
    app.delete("/api/institution/delete/:id", institutionController.deleteOneInstitution);
    app.delete("/api/institutions/deletes/:id", institutionController.deleteManyInstitutions);
};