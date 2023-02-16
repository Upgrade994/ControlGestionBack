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

    app.get("/api/instruments", instrumentController.getAllInstruments);
    app.get("/api/instrument/:id", instrumentController.getInstrument);
    app.put("/api/instrument/update/:id", instrumentController.updateInstrument);
    app.put("/api/instruments/updates/:id", instrumentController.updateManyInstruments);
    app.post("/api/instrument/save", instrumentController.saveInstrument);
    app.post("/api/instruments/saves/:id", instrumentController.saveManyInstruments);
    app.delete("/api/instrument/delete/:id", instrumentController.deleteOneInstrument);
    app.delete("/api/instruments/deletes/:id", instrumentController.deleteManyInstruments);
};