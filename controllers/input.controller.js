const Input = require("../models/input.models");

//Get all collection
exports.getInputs = async (req, res) => {

    await new Promise((resolve) => {
        Input.find({}).exec((err, input) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver el registro!'
                });
            }
            if (!input) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existen registros!'
                });
            }
            return res.status(200).send({
                status: 'success',
                input
            });
        });
    });
},

//Get only one
exports.getInput = async (req, res) => {
    const inputId = req.params.id;

    if(!inputId || inputId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el registroooo.'
        });
    }

    Input.findById(inputId, (err, input) => {
        console.log("find");
        if (err || !input) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro.'
            });
        }

        return res.status(200).send({
            status: 'success',
            input
        })
    });
},

//Save document
exports.saveInput = async (req, res) => {
    var params = req.body;

    try {
        var validate_folio = !validator.isInt('$params.folio');
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar.'
        });
    }

    if (
        validate_folio
    ) {
        const input = new Input();

        input.anio = params.anio;
        input.folio = params.folio;
        input.num_oficio = params.num_oficio;
        input.fecha_oficio = params.fecha_oficio;
        input.fecha_recepcion = params.fecha_recepcion;
        input.hora_recepcion = params.hora_recepcion;
        input.fecha_vencimiento = params.fecha_vencimiento;
        input.instrumento_juridico = params.instrumento_juridico;
        input.remitente = params.remitente;
        input.institucion_origen = params.institucion_origen;
        input.asunto = params.asunto;
        input.asignado = params.asignado;
        input.estatus = params.estatus;
        input.observacion = params.observacion;
        input.create_user = params.create_user;
        input.edit_count = params.edit_count;

        await input.save((err, inputStored) => {
            if (err || !inputStored) {
                return res.status(404).send({
                    status: "error",
                    message: "El registro no se ha guardado"
                });
            }
            return res.status(200).send({
                status: "Success",
                input: inputStored
            });
        });

    } else {
        return res.status(424).send({
            status: "error",
            message: "El registro no es valido"
        });
    }
},

//Update one
exports.updateInput = async (req, res) => {
    var inputId = req.params.id;
    var params = req.body;

    try {
        var validate_anio = !validator.isEmpty('$params.anio');
        var validate_folio = !validator.isEmpty('$params.folio');
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        });
    }

    if (
        validate_anio && validate_folio
    ) {
        await Input.findOneAndUpdate({_id: inputId}, params, {new:true}, (err, inputUpdated) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                });
            }

            if (!inputUpdated) {
                return res.status(404).send({
                    status: 'error',
                    input: inputUpdated
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'No existen registros'
            });
        });
    } else {
        return res.status(500).send({
            status: 'error',
            message: 'La validacion no es correcta'
        });
    }
},

//Delete one
exports.deleteInput = async (req, res) => {
    var inputId = req.params.id;

    await Input.findByIdAndDelete({_id: inputId}, (err, inputRemoved) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al borrar el registro'
            });
        }
        if (!inputRemoved) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro'
            });
        }
        console.log("Registro eliminado: ", inputRemoved);
        return res.status(200).send({
            status: 'success',
            input: inputRemoved
        })
    })
},

exports.findInput = async (req, res) => {
    const searchInput = req.params.search;
    console.log(searchInput);
    
    Input.find({
        "$or":[
            { num_oficio: { $regex: searchInput, $options:"i" }},
            { asunto: { $regex: searchInput, $options:"i" }}
        ]
    }).exec((err, inputs) =>{
        console.log(err);
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al buscar'
            });
        }
        if (!inputs || inputs.length <= 0 || inputs == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No hay relaciones con tu busqueda'
            });
        }
        return res.status(200).send({
            status: 'success',
            inputs
        });
    });
}