const Institution = require ("../models/institution.models");
var validator = require("validator");

//Get all no deleted institution documents
exports.getAllNoDeletedInstitution = async (req, res) => {
    await new Promise((resolve) => {
        Institution.find({ "deleted": false }).exec((err, institution) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los registros'
                });
            }
            if (!institution) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existen registros'
                });
            }
            return res.status(200).send({
                status: 'success',
                institution
            });
        });
    });
},

//Get all deleted institution documents
exports.getAllDeletedInstitution = async (req, res) => {
    await new Promise((resolve) => {
        Institution.find({ "deleted": true }).exec((err, institution) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los registros'
                });
            }
            if (!institution) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existen registros'
                });
            }
            return res.status(200).send({
                status: 'success',
                institution
            });
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

    await new Promise((resolve) => {
        Institution.findById(institutionId, (err, institution) => {
            if (err || !institution) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro.'
                });
            }
    
            return res.status(200).send({
                status: 'success',
                institution
            });
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
        await new Promise((resolve) => {
            Institution.findOneAndUpdate({_id: institutionId}, params, { new: true }, (err, institution) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
    
                if (!institution) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el registro'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    institution
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
        await new Promise((resolve) => {
            Institution.updateMany({_id: institutionId}, params, { new: true }, (err, institution) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
    
                if (!institution) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el registro'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    institution
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
        institution.deleted = false;

        await new Promise((resolve) => {
            institution.save((err, institution) => {
                if (err || !institution) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El registro no se ha guardado'
                    });
                }
    
                return res.status(200).send({
                    status: 'Success',
                    institution: institution
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

        await new Promise((resolve) => {
            institution.insertMany((err, institution) => {
                if (err || !institution) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El registro no se ha guardado'
                    });
                }
    
                return res.status(200).send({
                    status: 'Success',
                    institution: institution
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

//Delete one institution
exports.deleteOneInstitution = async (req, res) => {
    const institutionId = req.params.id;

    await new Promise((resolve) => {
        Institution.findByIdAndDelete({_id: institutionId}, (err, institution) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar el registro'
                });
            }
            if (!institution) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }
            return res.status(200).send({
                status: 'success',
                institution
            });
        });
    });
},

//Delete many institutions
exports.deleteManyInstitutions = async (req, res) => {
    const institutionId = req.params.id;

    await new Promise((resolve) => {
        Institution.deleteMany({_id: institutionId}, (err, institution) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar el registro'
                });
            }
            if (!institution) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el registro'
                });
            }
            return res.status(200).send({
                status: 'success',
                institution
            });
        });
    });
}