const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Produto = new Schema({
    nome: {
        type: String,
        require: true
    },
    valor: {
        type: Number,
        default: "0"
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    }
})

mongoose.model("produtos", Produto)