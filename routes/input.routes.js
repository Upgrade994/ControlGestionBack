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

    app.get("/api/inputs", inputController.getNoDeletedInputsInCurrentYear); 
    app.get("/api/inputs_previous", inputController.getNoDeletedInputsInPreviusYear);

    app.get("/api/inputs_area/:area?", inputController.getNoDeletedInputsInCurrentYearByNormalUsers); 
    app.get("/api/inputs_area_previous/:area?", inputController.getNoDeletedInputsInPreviusYearByNormalUsers);

    app.post("/api/create_inputs", inputController.createInput);
    app.get("/api/inputById/:id", inputController.getInputById);
    app.patch("/api/updateInputById/:id", inputController.updateInputById);
    app.get("/api/pdfs/:id", inputController.getPdfsByIdInput);
    app.get("/api/pdfs/:id/download", inputController.getPdfByIdInput);
    app.get("/api/pdfs_seguimiento/:id/download", inputController.getPdfByIdSeguimiento);
    app.get('/api/inputs_oficio/:id/duplicados', inputController.getDuplicatedOficiosByInputId);

    app.get('/api/inputs/areas/:search?', inputController.getAreasPerDay);
    app.get("/api/inputs-by-estatus", inputController.getEstatusPerArea);
    app.get('/api/reportes/:search?',inputController.reporteDiario); //reporte mensual
    app.get('/api/reporteresumen/:search?',inputController.reporteResumen); //reporte diario
};
