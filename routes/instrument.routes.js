const express = require("express");
const instrumentController = require("../controllers/instrument.controller");

module.exports = function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/instruments", instrumentController.getAllNoDeletedInstruments);
    // app.get("/api/deleted/instruments", instrumentController.getAllDeletedInstruments);
    // app.get("/api/instrument/:id", instrumentController.getInstrument);
    // app.put("/api/instrument/update/:id", instrumentController.updateInstrument);
    // app.put("/api/instruments/updates/:id", instrumentController.updateManyInstruments);
    // app.post("/api/instrument/save", instrumentController.saveInstrument);
    // app.post("/api/instruments/saves/:id", instrumentController.saveManyInstruments);
};