const Area = require ("../models/area.models");
var validator = require("validator");

//Get all Area documents
exports.getAllArea = async (req, res) => {
    Area.find({}).exec((err, res) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver los registros'
            });
        }
        if (!res) {
            return res.status(404).send({
                status: 'error',
                message: 'No existen registros'
            });
        }
        return res.status(200).send({
            status: 'success',
            res
        });
    });
},

//Get only one area
exports.getArea = async (req, res) => {
    const areaId = req.params.id;

    if (!areaId || areaId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el reigstro'
        });
    }

    Area.findById(areaId, (err, res) => {
        if (err || !res) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro.'
            });
        }

        return res.status(200).send({
            status: 'success',
            res
        });
    });
},

//Update One Area
exports.updateArea = async (req, res) => {
    const areaId = req.params.id;
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        await Area.findOneAndUpdate({_id: areaId}, params, { new: true }, (err, res) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                });
            }

            if (!res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }

            return res.status(200).send({
                status: 'success',
                res
            });
        });
    } else {
        return res.status(500).send({
            status: 'error',
            message: 'La validacion no es correcta'
        });
    }
},

//Update many Areas
exports.updateManyAreas = async (req, res) => {
    const areaId = req.params.id;
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        await Area.updateMany({_id: areaId}, params, { new: true }, (err, res) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                });
            }

            if (!res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }

            return res.status(200).send({
                status: 'success',
                res
            });
        });
    } else {
        return res.status(500).send({
            status: 'error',
            message: 'La validacion no es correcta'
        });
    }
},

//Save one Area
exports.saveArea = async (req, res) => {
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        const area = new Area();

        area.name = params.name;

        await area.save((err, res) => {
            if (err || !res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El registro no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'Success',
                area: res
            });
        });
    } else {
        return res.status(424).send({
            status: "error",
            message: "El registro no es valido"
        });
    }
},

//Save many Areas
exports.saveManyAreas = async (req, res) => {
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        const area = new Area();

        area.name = params.name;

        await area.insertMany((err, res) => {
            if (err || !res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El registro no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'Success',
                area: res
            });
        });
    } else {
        return res.status(424).send({
            status: "error",
            message: "El registro no es valido"
        });
    }
},

//Delete one Area
exports.deleteOneArea = async (req, res) => {
    const areaId = req.params.id;

    await Area.findByIdAndDelete({_id: areaId}, (err, res) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al borrar el registro'
            });
        }
        if (!res) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro'
            });
        }
        return res.status(200).send({
            status: 'success',
            res
        });
    });
},

//Delete many areas
exports.deleteManyAreas = async (req, res) => {
    const areaId = req.params.id;

    await Area.deleteMany({_id: areaId}, (err, res) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al borrar el registro'
            });
        }
        if (!res) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro'
            });
        }
        return res.status(200).send({
            status: 'success',
            res
        });
    });
}