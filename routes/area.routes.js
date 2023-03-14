const express = require("express");
const areaController = require("../controllers/area.controller");

module.exports = function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/areas", areaController.getAllNoDeletedAreas);
    app.get("/api/deleted/areas", areaController.getAllNoDeletedAreas);
    app.get("/api/area/:id", areaController.getArea);
    app.put("/api/area/update/:id", areaController.updateArea);
    app.put("/api/areas/updates/:id", areaController.updateManyAreas);
    app.post("/api/area/save", areaController.saveArea);
    app.post("/api/areas/saves/:id", areaController.saveManyAreas);
};