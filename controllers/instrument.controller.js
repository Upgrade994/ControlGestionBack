const Instrument = require ("../models/instrument.models");

exports.getAllNoDeletedInstruments = async (req, res) => {
    try {
        const instrument = await Instrument.find({}).sort({ name: 1 }).lean().exec();
        res.status(200).json({ status: 'success', instrument });
    } catch (error) {
        console.error("Error obteniendo las instrumentos:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener las instrumentos' });
    }
};

exports.getInstrumentById = async (req, res) => {
    try {
      const { id } = req.params; 
  
      const instrument = await Instrument.findById(id);
  
      if (!instrument) {
        return res.status(404).json({ status: 'error', message: 'Instrumento no encontrado' });
      }
  
      res.status(200).json({ status: 'success', instrument });
    } catch (error) {
      console.error("Error obteniendo el instrumento:", error);
      res.status(500).json({ status: 'error', message: 'Error al obtener el instrumento' });
    }
};

exports.saveInstrument = async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ status: 'error', message: 'El nombre del instrumento es requerido' });
      }
  
      const newInstrument = new Instrument({
        name: req.body.name.toUpperCase(), // Convertir a mayúsculas
        deleted: false 
      });
  
      const savedInstrument = await newInstrument.save();
  
      res.status(201).json({ status: 'success', message: 'Instrumento creado con éxito', instrument: savedInstrument });
  
    } catch (error) {
      if (error.code === 11000) { // Manejar error de duplicidad (índice único)
        return res.status(400).json({ status: 'error', message: 'Ya existe un instrumento con ese nombre' });
      }
  
      console.error("Error guardando el instrumento:", error);
      res.status(500).json({ status: 'error', message: 'Error al guardar el instrumento' });
    }
  };

exports.updateInstrument = async (req, res) => {
    try {
      const { id } = req.params; 
      const { name } = req.body;
  
      const instrument = await Instrument.findByIdAndUpdate(id, { name }, { new: true }); 
  
      if (!instrument) {
        return res.status(404).json({ status: 'error', message: 'Instrumento no encontrado' });
      }
  
      res.status(200).json({ status: 'success', message: 'Instrumento actualizado con éxito', instrument });
    } catch (error) {
      console.error("Error actualizando el instrumento:", error);
      res.status(500).json({ status: 'error', message: 'Error al actualizar el instrumento' });
    }
};