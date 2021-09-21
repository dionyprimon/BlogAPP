const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Pedido = new Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: "clientes",
        required: true
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: "produtos",
        required: true
    },
    quantidade: {
        type: Number,
        default: "0"
    },
    valorUnit: {
        type: Number,
        default: "0"
    },
    valorTotal: {
        type: Number,
        default: "0"
    },
    data: {
        type: Date,
        default: Date.now
    }
})

mongoose.model("pedidos", Pedido)