const Institution = require ("../models/institution.models");
var validator = require("validator");

//Get all institution documents
exports.getAllInstitution = async (req, res) => {
    Institution.find({}).exec((err, res) => {
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

//Get only one institution
exports.getInstitution = async (req, res) => {
    const institutionId = req.params.id;

    if (!institutionId || institutionId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el reigstro'
        });
    }

    Institution.findById(institutionId, (err, res) => {
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

//Update One Institution
exports.updateInstitution = async (req, res) => {
    const institutionId = req.params.id;
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
        await Institution.findOneAndUpdate({_id: institutionId}, params, { new: true }, (err, res) => {
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

//Update many Institutions
exports.updateManyInstitutions = async (req, res) => {
    const institutionId = req.params.id;
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
        await Institution.updateMany({_id: institutionId}, params, { new: true }, (err, res) => {
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

//Save one Institution
exports.saveInstitution = async (req, res) => {
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        const institution = new Institution();

        institution.name = params.name;

        await institution.save((err, res) => {
            if (err || !res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El registro no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'Success',
                institution: res
            });
        });
    } else {
        return res.status(424).send({
            status: "error",
            message: "El registro no es valido"
        });
    }
},

//Save many Institutions
exports.saveManyInstitutions = async (req, res) => {
    const params = req.body;

    try {
        var validate_name = !validator.isEmpty(params.name);
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar'
        });
    }

    if (validate_name) {
        const institution = new Institution();

        institution.name = params.name;

        await institution.insertMany((err, res) => {
            if (err || !res) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El registro no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'Success',
                institution: res
            });
        });
    } else {
        return res.status(424).send({
            status: "error",
            message: "El registro no es valido"
        });
    }
},

//Delete one institution
exports.deleteOneInstitution = async (req, res) => {
    const institutionId = req.params.id;

    await Institution.findByIdAndDelete({_id: institutionId}, (err, res) => {
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

//Delete many institutions
exports.deleteManyInstitutions = async (req, res) => {
    const institutionId = req.params.id;

    await Institution.deleteMany({_id: institutionId}, (err, res) => {
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