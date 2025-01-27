const express = require("express");
const inputController = require("../controllers/input.controller");

module.exports = function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/inputs/:search?", inputController.getNoDeletedInputs);
    app.get("/api/inputs_area/:area?", inputController.getNoDeletedInputsByNormalUsers);
    app.post("/api/create_inputs", inputController.createInput);
    app.get("/api/inputById/:id", inputController.getInputById);
    app.patch("/api/updateInputById/:id", inputController.updateInputById);

    app.get('/api/inputs/areas/:search?', inputController.getAreasPerDay);
    app.get("/api/inputs-by-estatus", inputController.getEstatusPerArea);
    app.get('/api/reportes/:search?',inputController.reporteDiario); //reporte mensual
    app.get('/api/reporteresumen/:search?',inputController.reporteResumen); //reporte diario
};