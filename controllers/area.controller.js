const Area = require("../models/area.models"); // Importa el modelo
const mongoose = require('mongoose');

// Función para validar si un ID es un ObjectId válido
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.getAllAreas = async (req, res) => {
    try {
        const areas = await Area.find({}).sort({ area: 1 }).lean().exec();
        res.status(200).json({ status: 'success', areas });
    } catch (error) {
        console.error("Error obteniendo las áreas:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener las áreas' });
    }
};

exports.getArea = async (req, res) => {
    try {
      const id = req.params.id;
      if (!isValidObjectId(id)) {
          return res.status(400).json({ status: 'error', message: 'ID de área no válido' });
      }
        const area = await Area.findById(id);

        if (!area) {
            return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
        }

        res.status(200).json({ status: 'success', area });
    } catch (error) {
        console.error("Error obteniendo el área:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener el área' });
    }
};

exports.saveArea = async (req, res) => {
    try {
        if (!req.body.area) {
            return res.status(400).json({ status: 'error', message: 'El nombre del área es requerido' });
        }

        const areaExistente = await Area.findOne({ area: req.body.area });
        if (areaExistente) {
            return res.status(400).json({ status: 'error', message: 'Ya existe un área con ese nombre' });
        }

        const nuevaArea = new Area({ area: req.body.area });
        const areaGuardada = await nuevaArea.save();

        res.status(201).json({ status: 'success', message: 'Área creada con éxito', area: areaGuardada });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const erroresValidacion = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ status: 'error', message: erroresValidacion });
        }
        console.error("Error guardando el área:", error);
        res.status(500).json({ status: 'error', message: 'Error al guardar el área' });
    }
};

exports.updateArea = async (req, res) => {
    try {
      const id = req.params.id;

      if (!isValidObjectId(id)) {
          return res.status(400).json({ status: 'error', message: 'ID de área no válido' });
      }

        if (!req.body.area) {
            return res.status(400).json({ status: 'error', message: 'El nombre del área es requerido' });
        }

        const areaExistente = await Area.findOne({ area: req.body.area, _id: { $ne: id } });
        if (areaExistente) {
            return res.status(400).json({ status: 'error', message: 'Ya existe un área con ese nombre' });
        }

        const areaActualizada = await Area.findByIdAndUpdate(id, { area: req.body.area }, { new: true, runValidators: true });

        if (!areaActualizada) {
            return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
        }

        res.status(200).json({ status: 'success', message: 'Área actualizada con éxito', area: areaActualizada });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const erroresValidacion = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ status: 'error', message: erroresValidacion });
        }
        console.error("Error actualizando el área:", error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el área' });
    }
};

exports.deleteArea = async (req, res) => {
    try {
      const id = req.params.id;

      if (!isValidObjectId(id)) {
          return res.status(400).json({ status: 'error', message: 'ID de área no válido' });
      }

        const areaEliminada = await Area.findByIdAndDelete(id);

        if (!areaEliminada) {
            return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
        }

        res.status(200).json({ status: 'success', message: 'Área eliminada con éxito' });
    } catch (error) {
        console.error("Error eliminando el área:", error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar el área' });
    }
};