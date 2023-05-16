const Input = require("../models/input.models");
var validator = require("validator");
const NodeCache = require('node-cache');
const cache = new NodeCache(); // Creamos una instancia de caché
const cacheTimeout = 60; // Definimos el tiempo de expiración del caché en segundos

//Get all no deleted documents in collection
exports.getNoDeletedInputs = async (req, res) => {
    const cacheKey = 'inputs';

    // Buscamos los registros en caché
    let inputs = cache.get(cacheKey);

    if (!inputs) {
        // Si los registros no están en caché, los buscamos en la base de datos
        try {
          inputs = await Input.find({ deleted: false }, {pdfString: 0}).sort({ createdAt: -1 }).lean().exec();
    
          // Agregamos los registros a la caché
          cache.set(cacheKey, inputs, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (inputs.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        input: inputs,
    });
},

exports.getNoDeletedInputsInTramit = async (req, res) => {
    const cacheKey = 'seguimiento';

    // Buscamos los registros en caché
    let inputs = cache.get(cacheKey);

    if (!inputs) {
        // Si los registros no están en caché, los buscamos en la base de datos
        try {
          inputs = await Input.find({ deleted: false, estatus: 'EN TRAMITE' }, {pdfString: 0}).sort({ createdAt: -1 }).lean().exec();
    
          // Agregamos los registros a la caché
          cache.set(cacheKey, inputs, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (inputs.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        input: inputs,
    });
},

//Get all deleted documents in collection
exports.getDeletedInputs = async (req, res) => {
    const cacheKey = 'inputs';
    let inputs = cache.get(cacheKey);

    if (!inputs) {
        try {
          inputs = await Input.find({ deleted: true }, {pdfString: 0}).sort({ createdAt: -1 }).lean().exec();
          cache.set(cacheKey, inputs, cacheTimeout);
        } catch (error) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
          });
        }
    }

    if (inputs.length === 0) {
        return res.status(404).send({
            status: 'error',
            message: 'No existen registros!',
        });
    }

    return res.status(200).send({
        status: 'success',
        input: inputs,
    });
},

//Get only one
exports.getInput = async (req, res) => {
    const inputId = req.params.id;

    if(!inputId || inputId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el registro.'
        });
    }

    Input.findById(inputId, (err, input) => {
        // console.log("find");
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
        input.deleted = params.deleted;
        input.pdfString = params.pdfString;

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
                message: 'Ok'
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
        });
    });
},

exports.findInput = async (req, res) => {
    const searchInput = req.params.search;
    // console.log(searchInput);
    
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
},

exports.getAreasPerDay = async (req, res) => {
    const searchDay = req.params.search;

    await Input.aggregate([ 
        { $match: { fecha_recepcion: { $regex: searchDay, $options: "i" }}},
        { $group: {
            _id: '$asignado',
            cantidad: {$sum: 1},
            asunto: { $push: '$asunto' }
        }} 
    ]).exec((err, inputs) => {
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
},

exports.getEstatusPerArea = async (req, res) => {
    // const fechaInicio = req.params.fechaInicio;
    // const fechaFin = req.params.fechaFin;
    // console.log(req.params);

    try {
        const inputs = await Input.aggregate([
            { $match: {
                // fecha_recepcion: { $gte: fechaInicio , $lt: fechaFin },
                deleted: false
              }},{ $group: {
                _id: { asignado: "$asignado", estatus: "$estatus" },
                total: { $sum: 1 }
              }},
              // Proyectar los resultados para que se vean más legibles
              { $group: {
                _id: "$_id.asignado",
                data: {
                    $push: {
                        estatus: "$_id.estatus",
                        total: "$total"
                    }
                }
              }},
              // Ordenar por área y estado
              { $sort: {
                "_id": 1,
                "estatus.estatus": 1
              }}
          ]);

          if (!inputs || inputs.length <= 0 || inputs == null) {
            return res.status(404).send({
              status: "error",
              message: "No hay relaciones con tu busqueda",
            });
          }
      
          return res.status(200).send({
            status: "success",
            inputs,
          });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al buscar",
          });
    }
}