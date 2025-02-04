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
    app.get("/api/instruments/:id", instrumentController.getInstrumentById); 
    app.post("/api/instruments/new", instrumentController.saveInstrument); 
    app.put("/api/instruments/:id", instrumentController.updateInstrument); 
};