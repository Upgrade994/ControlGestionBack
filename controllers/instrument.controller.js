const Instrument = require ("../models/instrument.models");
var validator = require("validator");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const cacheTimeout = 60;

//Get all no deleted instrument documents
exports.getAllNoDeletedInstruments = async (req, res) => {
    const cacheKey = 'instruments';
    let instruments = cache.get(cacheKey);

    if (!instruments) {
        try {
          instruments = await Instrument.find({ deleted: false }).sort({ name: 1 }).lean().exec();
          cache.set(cacheKey, instruments, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (instruments.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        instrument: instruments,
    });
},

//Get all deleted instrument documents
exports.getAllDeletedInstruments = async (req, res) => {
    const cacheKey = 'instruments';
    let instruments = cache.get(cacheKey);

    if (!instruments) {
        try {
          instruments = await Instrument.find({ deleted: true }).sort({ name: 1 }).lean().exec();
          cache.set(cacheKey, instruments, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (instruments.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        instrument: instruments,
    });
},

//Get only one instrument
exports.getInstrument = async (req, res) => {
    const instrumentId = req.params.id;

    if (!instrumentId || instrumentId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el reigstro'
        });
    }

    await new Promise((resolve) => {
        Instrument.findById(instrumentId, (err, instrument) => {
            if (err || !instrument) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro.'
                });
            }
    
            return res.status(200).send({
                status: 'success',
                instrument
            });
        });
    });
},

//Update One Instrument
exports.updateInstrument = async (req, res) => {
    const instrumentId = req.params.id;
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
            Instrument.findOneAndUpdate({_id: instrumentId}, params, { new: true }, (err, instrument) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
    
                if (!instrument) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el registro'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    instrument
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

//Update many Instruments
exports.updateManyInstruments = async (req, res) => {
    const instrumentId = req.params.id;
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
            Instrument.updateMany({_id: instrumentId}, params, { new: true }, (err, instrument) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
    
                if (!instrument) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el registro'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    instrument
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

//Save one Instrument
exports.saveInstrument = async (req, res) => {
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        const instrument = new Instrument();

        instrument.name = params.name;
        instrument.deleted = false;

        await new Promise((resolve) => {
            instrument.save((err, instrument) => {
                if (err || !instrument) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El registro no se ha guardado'
                    });
                }
    
                return res.status(200).send({
                    status: 'Success',
                    instrument: instrument
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

//Save many Instruments
exports.saveManyInstruments = async (req, res) => {
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        const instrument = new Instrument();

        instrument.name = params.name;

        await new Promise((resolve) => {
            instrument.insertMany((err, instrument) => {
                if (err || !instrument) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El registro no se ha guardado'
                    });
                }
    
                return res.status(200).send({
                    status: 'Success',
                    instrument: instrument
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

//Delete one instrument
exports.deleteOneInstrument = async (req, res) => {
    const instrumentId = req.params.id;

    await new Promise((resolve) => {
        Instrument.findByIdAndDelete({_id: instrumentId}, (err, instrument) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar el registro'
                });
            }
            if (!instrument) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }
            return res.status(200).send({
                status: 'success',
                instrument
            });
        });
    });
},

//Delete many instrument
exports.deleteManyInstruments = async (req, res) => {
    const instrumentId = req.params.id;

    await new Promise((resolve) => {
        Instrument.deleteMany({_id: instrumentId}, (err, instrument) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar el registro'
                });
            }
            if (!instrument) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }
            return res.status(200).send({
                status: 'success',
                instrument
            });
        });
    });
}