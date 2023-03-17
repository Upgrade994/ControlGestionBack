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

    app.get("/api/inputs", inputController.getNoDeletedInputs);
    app.get("/api/deleted/inputs", inputController.getDeletedInputs);
    app.get("/api/input/:id", inputController.getInput);
    app.post("/api/input/save", inputController.saveInput);
    app.put("/api/input/update/:id", inputController.updateInput);
    app.delete("/api/input/delete/:id", inputController.deleteInput);
    app.get('/api/input/find/:search?', inputController.findInput);
    app.get('/api/inputs/areas/:search?', inputController.getAreasPerDay);
};