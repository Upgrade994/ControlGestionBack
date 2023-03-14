const mongoose = require("mongoose");

const Areas = mongoose.model(
    "Areas",
    new mongoose.Schema({
        cabecera: {
            type: String,
            uppercase: true,
            unique: true
        },
        direccion: {
            type: String,
            uppercase: true,
            unique: true
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