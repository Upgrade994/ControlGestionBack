const Instrument = require ("../models/instrument.models");
var validator = require("validator");

//Get all instrument documents
exports.getAllInstruments = async (req, res) => {
    Instrument.find({}).exec((err, res) => {
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

//Get only one instrument
exports.getInstrument = async (req, res) => {
    const instrumentId = req.params.id;

    if (!instrumentId || instrumentId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el reigstro'
        });
    }

    Instrument.findById(instrumentId, (err, res) => {
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
        await Instrument.findOneAndUpdate({_id: instrumentId}, params, { new: true }, (err, res) => {
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
        await Instrument.updateMany({_id: instrumentId}, params, { new: true }, (err, res) => {
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

        await instrument.save((err, res) => {
            if (err || !res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El registro no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'Success',
                instrument: res
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

        await instrument.insertMany((err, res) => {
            if (err || !res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El registro no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'Success',
                instrument: res
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

    await Instrument.findByIdAndDelete({_id: instrumentId}, (err, res) => {
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

//Delete many instrument
exports.deleteManyInstruments = async (req, res) => {
    const instrumentId = req.params.id;

    await Instrument.deleteMany({_id: instrumentId}, (err, res) => {
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