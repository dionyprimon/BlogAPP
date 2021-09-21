const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Cliente = new Schema({
    nome: {
        type: String,
        require: true
    },
    telefone: {
        type: Number,
        default: "0"
    },
    email: {
        type: String,
        required: true
    }
})

mongoose.model("clientes", Cliente)