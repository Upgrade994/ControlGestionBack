const Input = require("../models/inputs.models");
var validator = require("validator");
const ExcelReport = require('../services/ExcelDailyReport.js');
const ExcelResumeReport = require('../services/ExcelResumeReport.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

//Traer todos los registros con privilegios de enlace, informacion por area 08/01/2025 (FUNCIONANDO Y TERMINADO)
exports.getNoDeletedInputsByNormalUsers = async (req, res) => {
    let areaUsuario;

    // Determinar cómo se proporciona el área (prioridad: query > params > body)
    if (req.query.area) {
        areaUsuario = req.query.area;
    } else if (req.params.area) {
        areaUsuario = req.params.area;
    } else if (req.body.area) {
        areaUsuario = req.body.area;
    } else {
        return res.status(400).json({
            status: 'error',
            message: 'El parámetro "area" es requerido (query, params o body).',
        });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    try {
        const query = { deleted: false, asignado: areaUsuario };
        let searchRegex = null;

        if (search) {
            const searchAsNumber = Number(search);

            if (!isNaN(searchAsNumber)) {
                query.folio = searchAsNumber;
            } else {
                try {
                    searchRegex = new RegExp(search, 'i'); // 'i' para búsqueda insensible a mayúsculas/minúsculas
                } catch (e) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Expresión de búsqueda no válida.',
                    });
                }
                query.$or = [
                    { num_oficio: { $regex: searchRegex } },
                    { asunto: { $regex: searchRegex } },
                    { estatus: { $regex: searchRegex } },
                    { fecha_recepcion: { $regex: searchRegex } },
                    // Agrega aquí otros campos de texto en los que deseas buscar
                ];
            }
        }

        const totalInputs = await Input.countDocuments(query); // Contar documentos con el filtro

        const projection = {
            anio: 1,
            folio: 1,
            num_oficio: 1,
            fecha_recepcion: 1,
            asignado: 1,
            asunto: 1,
            estatus: 1,
            _id: 1,
            // archivosPdf: 1,
        };

        const inputs = await Input.find(query, projection)
            .sort({ anio: -1, createdAt: -1 })
            // .allowDiskUse(true)
            .skip(skip)
            .limit(limit)
            .lean();

        if (inputs.length === 0) {
            return res.status(204).json();
        }

        return res.status(200).json({
            status: 'success',
            inputs: inputs,
            totalInputs: totalInputs,
            totalPages: Math.ceil(totalInputs / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error en getNoDeletedInputsByNormalUsers:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al devolver el registro.',
        });
    }
};

//Traer todos los registros con todos los privilegios posibles 07/01/2025 (FUNCIONANDO Y TERMINADO)
exports.getNoDeletedInputs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const search = req.query.search || '';
        const query = { deleted: false };
        let searchRegex = null;

        if (search) {
            // Intenta convertir el término de búsqueda a un número
            const searchAsNumber = Number(search);
      
            if (!isNaN(searchAsNumber)) {
              // Si es un número válido, busca por igualdad en el campo folio
              query.folio = searchAsNumber;
            } else {
              try {
                searchRegex = new RegExp(search, 'i');
              } catch (e) {
                return res.status(400).json({
                  status: 'error',
                  message: 'Expresión de búsqueda no válida.',
                });
              }
              // Si no es un número, usa una expresión regular para los campos de texto
              query.$or = [
                { num_oficio: { $regex: searchRegex } },
                { asunto: { $regex: searchRegex } },
                { estatus: { $regex: searchRegex } },
                { fecha_recepcion: { $regex: searchRegex } },
                // ... otros campos de texto
              ];
            }
          }

        const projection = {
            anio: 1,
            folio: 1,
            num_oficio: 1,
            fecha_recepcion: 1,
            asignado: 1,
            asunto: 1,
            estatus: 1,
            _id: 1,
        };

        const inputs = await Input.find(query, projection)
            .sort({ anio: -1, createdAt: -1 })
            // .allowDiskUse(true)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalInputs = await Input.countDocuments(query);

        if (inputs.length === 0) {
            return res.status(204).json({
            status: 'error',
            message: 'No existen registros!',
            });
        }

        return res.status(200).json({
            status: 'success',
            inputs: inputs,
            totalInputs: totalInputs,
            totalPages: Math.ceil(totalInputs / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al devolver el registro.',
        });
    }
},

// CONSIDERAR BORRAR
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

// CONSIDERAR BORRAR
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

// CONSIDERAR BORRAR
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

// CONSIDERAR BORRAR
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

// ya no sirve
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