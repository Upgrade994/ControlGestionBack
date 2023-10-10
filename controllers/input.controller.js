const Input = require("../models/input.models");
var validator = require("validator");
const ExcelReport = require('../services/ExcelDailyReport.js');
const ExcelResumeReport = require('../services/ExcelResumeReport.js');

//Get all no deleted documents in collection by normal users
exports.getNoDeletedInputsByNormalUsers = async (req, res) => {
    const areaUsuario = req.params.area;
    // console.log("ok?");
    try {
        const inputs = await Input.find(
            { deleted: false, asignado: areaUsuario },
            { pdfString: 0 }
        )
            .sort({ createdAt: -1 })
            .lean();

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
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
        });
    }
},

//Get all no deleted documents in collection
exports.getNoDeletedInputs = async (req, res) => {
    try {
        const inputs = await Input.find(
            { deleted: false },
            { pdfString: 0 }
        )
            .sort({ createdAt: -1 })
            .allowDiskUse(true)
            .lean();

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
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!!!!',
        });
    }
},

exports.getNoDeletedInputsInTramitByNormalUsers = async (req, res) => {
    const areaUsuario = req.params.area;

    try {
        const inputs = await Input.find(
            { deleted: false, asignado: areaUsuario, estatus: 'EN TRAMITE' },
            { pdfString: 0 }
        )
            .sort({ createdAt: -1 })
            .lean();

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
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
        });
    }
},

exports.getNoDeletedInputsInTramit = async (req, res) => {
    try {
        const inputs = await Input.find(
            { deleted: false, estatus: 'EN TRAMITE' },
            { pdfString: 0 }
        )
            .sort({ createdAt: -1 })
            .lean();

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
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
        });
    }
},

//Get all deleted documents in collection
exports.getDeletedInputs = async (req, res) => {
    try {
        const inputs = await Input.find(
            { deleted: true },
            { pdfString: 0 }
        )
            .sort({ createdAt: -1 })
            .lean();

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
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al devolver el registro!',
        });
    }
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

exports.reporteResumen = async (req, res) => {
    const searchInput = req.params.search;

    //El match por alguna razon no funcionaba con fechas anteriores de 2023
    const aggregationResult = await Input.aggregate([
        { $match: { fecha_recepcion: { $regex: searchInput, $options: "i" }}},
        { $group: {
            _id: '$asignado',
            cantidad: {$sum: 1},
            asunto: { $push: '$asunto' }
        }} 
    ]);

    const workbook = ExcelResumeReport(aggregationResult);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "data.xlsx"
      ); 
      await workbook.xlsx.write(res)
      return res.status(200).end();
    //   return res.status(200).json(aggregationResult)
}

exports.reporteDiario = async (req, res) => {
    let searchDay = req.params.search;
    // console.log(searchDay, '449');

    if (searchDay.length === 10) {
        // console.log(searchDay, 'if');
        // Consulta exacta por fecha
        const aggregationResult = await Input.find({
          fecha_recepcion: { $regex: searchDay, $options: "i" }
        }, { deleted: false }, { pdfString: 0 });
    
        const workbook = ExcelReport(aggregationResult);
    
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "data.xlsx"
        );
    
        await workbook.xlsx.write(res);
    
        return res.status(200).end();
    } else {
        // console.log(searchDay, 'else');
        // Consulta por rango de fechas
        const [startDate, endDate] = req.params.search.split(' ');
    
        const aggregationResult = await Input.find({
          fecha_recepcion: { $gte: startDate, $lte: endDate }
        }, { deleted: false }, { pdfString: 0 });
    
        const workbook = ExcelReport(aggregationResult);
    
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "data.xlsx"
        );
    
        await workbook.xlsx.write(res);
    
        return res.status(200).end();
      }

    // Optimizacion de la busqueda
    // const aggregationResult = await Input.find({
    //     fecha_recepcion: { $regex: searchDay, $options: "i" }
    // });

    // const workbook = ExcelReport(aggregationResult);
    
    // res.setHeader(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=" + "data.xlsx"
    // );  

    // await workbook.xlsx.write(res)

    // return res.status(200).end();
}