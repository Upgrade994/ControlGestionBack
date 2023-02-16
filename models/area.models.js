const mongoose = require("mongoose");

const Areas = mongoose.model(
    "Areas",
    new mongoose.Schema({
        cabecera: {
            type: String,
            uppercase: true
        },
        direccion: {
            type: String,
            uppercase: true
        },
        deleted: {
            type: Boolean
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
    })
);

module.exports = Areas;