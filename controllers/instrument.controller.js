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

exports.saveInstruments = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ status: 'error', message: 'El nombre del instrumento es requerido' });
        }

        const instrumentExistente = await Instrument.findOne({ name: req.body.name });
        if (instrumentExistente) {
            return res.status(400).json({ status: 'error', message: 'Ya existe un instrumento con ese nombre' });
        }

        const nuevoInstrumento = new Instrument({ name: req.body.name });
        const instrumentoGuardado = await nuevoInstrumento.save();

        res.status(201).json({ status: 'success', message: 'Instrumento creado con éxito', name: instrumentoGuardado });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const erroresValidacion = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ status: 'error', message: erroresValidacion });
        }
        console.error("Error guardando el instrumento:", error);
        res.status(500).json({ status: 'error', message: 'Error al guardar el instrumento' });
    }
};