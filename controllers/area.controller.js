const Areas = require ("../models/area.models");
var validator = require("validator");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const cacheTimeout = 60;

//Get all no deleted Area documents
exports.getAllNoDeletedAreas = async (req, res) => {
    const cacheKey = 'areas';
    let areas = cache.get(cacheKey);

    if (!areas) {
        try {
          areas = await Areas.find({ deleted: false }).sort({ direccion: 1 }).lean().exec();
          cache.set(cacheKey, areas, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (areas.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        area: areas,
    });
},

//Get all deleted Area documents
exports.getAllDeletedAreas = async (req, res) => {
    const cacheKey = 'areas';
    let areas = cache.get(cacheKey);

    if (!areas) {
        try {
          areas = await Areas.find({ deleted: true }).sort({ direccion: 1 }).lean().exec();
          cache.set(cacheKey, areas, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (areas.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        area: areas,
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

    await new Promise((resolve) => {
        Areas.findById(areaId, (err, area) => {
            if (err || !area) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro.'
                });
            }
    
            return res.status(200).send({
                status: 'success',
                area
            });
        });
    });
},

//Update One Area
exports.updateArea = async (req, res) => {
    const areaId = req.params.id;
    const params = req.body;
    // console.log(params);
    try {
        var validate_direccion = !validator.isEmpty(params.direccion);
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_direccion) {
        await new Promise((resolve) => {
            Areas.findOneAndUpdate({_id: areaId}, params, { new: true }, (err, area) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
    
                if (!area) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el registro'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    area
                });
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
        await new Promise((resolve) => {
            Areas.updateMany({_id: areaId}, params, { new: true }, (err, area) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
    
                if (!area) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el registro'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    area
                });
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
        var validate_direccion = !validator.isEmpty(params.direccion);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_direccion) {
        const area = new Areas();

        area.cabecera = params.cabecera;
        area.direccion = params.direccion;
        area.deleted = false;

        await new Promise((resolve) => {
            area.save((err, area) => {
                if (err || !area) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El registro no se ha guardado'
                    });
                }
    
                return res.status(200).send({
                    status: 'Success',
                    area: area
                });
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
        const area = new Areas();

        area.name = params.name;

        await new Promise((resolve) => {
            area.insertMany((err, area) => {
                if (err || !area) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El registro no se ha guardado'
                    });
                }
    
                return res.status(200).send({
                    status: 'Success',
                    area: area
                });
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

    await new Promise((resolve) => {
        Areas.findByIdAndDelete({_id: areaId}, (err, area) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar el registro'
                });
            }
            if (!area) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }
            return res.status(200).send({
                status: 'success',
                area
            });
        });
    });
},

//Delete many areas
exports.deleteManyAreas = async (req, res) => {
    const areaId = req.params.id;

    await new Promise((resolve) => {
        Areas.deleteMany({_id: areaId}, (err, area) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar el registro'
                });
            }
            if (!area) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }
            return res.status(200).send({
                status: 'success',
                area
            });
        });
    });
}