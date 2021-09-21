//carregando módulos
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Usuario")
const { eAdmin } = require("../helpers/eAdmin")

require('../models/Produto')
const Produto = mongoose.model('produtos')

require('../models/Cliente')
const Cliente = mongoose.model('clientes')

require('../models/Pedido')
const Pedido = mongoose.model('pedidos')


//ROTAS


//rota para pagina de pedidos
router.get('/pedidos', (req, res) => {
    Pedido.find().lean().populate('cliente', 'nome').sort({ data: 'desc' }).then((pedidos) => {
        res.render("pedidos/index", { pedidos: pedidos })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar os pedidos")
        res.redirect("pedidos")
    })
})


//rota para pagina de criar novos pedidos
router.get('/addpedido', (req, res) => {
    Cliente.find().lean().sort({ nome: 'asc' }).then((clientes) => {
        Produto.find().lean().sort({ nome: 'asc' }).then((produtos) => {
            res.render('pedidos/addpedido', { clientes: clientes, produtos: produtos })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao mostrar as vendas")
            res.redirect("pedidos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Um erro interno ocorreu ao tentar gerar as vendas.")
        res.redirect("pedidos")
    })
})


//função de criar novos pedidos
router.post('/newpedido', (req, res) => {

    var erros = []
        //validação do campo quantidade
    if (!req.body.quantidade || typeof req.body.quantidade == undefined || req.body.quantidade == null) {
        erros.push({ texto: "Quantidade invalida" })
    }
    if (erros.length > 0) {
        res.render("pedidos", { erros: erros })
    } else {
        novoPedido = {

            cliente: req.body.cliente,
            item: req.body.produto,
            quantidade: req.body.quantidade,
            valorUnit: req.body.valorVenda,
            valorTotal: req.body.valorVenda * req.body.quantidade

        }
        new Pedido(novoPedido).save().then(() => {
            req.flash('success_msg', "Pedido cadastrado")
            res.redirect("pedidos")
        }).catch((err) => {
            req.flash('error_msg', "Erro 8870 ao cadastrar pedido, tente novamente")
            res.redirect("pedidos")
        })
    }
})


//rota para a tela de consulta de um pedido
router.get("/consultapedido/:id", (req, res) => {

    Pedido.findOne({ _id: req.params.id }).lean().then((pedidos) => {
        Cliente.find({ _id: pedidos.cliente }).lean().then((clientes) => {
            Produto.find({ _id: pedidos.item }).lean().then((produtos) => {
                res.render('pedidos/consultapedido', { pedidos: pedidos, clientes: clientes, produtos: produtos })
            }).catch((err) => {
                req.flash("error_msg", "Erro 1255 ao consultar pedido, tente novamente")
                res.redirect("listaprodutos")
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro 1256 ao consultar pedido, tente novamente")
            res.redirect("listaprodutos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro 1257 ao consultar pedido, tente novamente")
        res.redirect("listaprodutos")
    })
})


//rota para a tela de editar de um pedido
router.get("/editpedido/:id", (req, res) => {

    Pedido.findOne({ _id: req.params.id }).lean().then((pedidos) => {
        Cliente.find({ _id: pedidos.cliente }).lean().then((clientes) => {
            Produto.find({ _id: pedidos.item }).lean().then((produtos) => {
                res.render('pedidos/editpedido', { pedidos: pedidos, clientes: clientes, produtos: produtos })
            }).catch((err) => {
                req.flash("error_msg", "Erro 1255 ao editar pedido, tente novamente")
                res.redirect("listaprodutos")
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro 1256 ao editar pedido, tente novamente")
            res.redirect("listaprodutos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro 1257 ao editar pedido, tente novamente")
        res.redirect("listaprodutos")
    })
})


//função de alterar um pedido
router.post('/editapedido', (req, res) => {

    var erros = []
        //validação do campo quantidade
    if (!req.body.quantidade || typeof req.body.quantidade == undefined || req.body.quantidade == null) {
        erros.push({ texto: "Quantidade invalida" })
    }
    if (erros.length > 0) {
        res.render("pedidos", { erros: erros })
    } else {

        Pedido.findOne({ _id: req.body.id }).then((pedidos) => {

            pedidos.cliente = req.body.cliente,
                pedidos.item = req.body.produto,
                pedidos.quantidade = req.body.quantidade,
                pedidos.valorUnit = req.body.valorVenda,
                pedidos.valorTotal = req.body.valorVenda * req.body.quantidade

            pedidos.save().then(() => {
                req.flash('success_msg', "Pedido alterado")
                res.redirect("/pedidos/pedidos")
            }).catch((err) => {
                req.flash('error_msg', "Erro 8870 ao alterar pedido, tente novamente")
                res.redirect("pedidos")
            })

        }).catch((err) => {
            req.flash('error_msg', "Erro 8870 ao alterar pedido, tente novamente")
            res.redirect("pedidos")
        })
    }
})


//função deletar pedido
router.post("/deletpedido", eAdmin, (req, res) => {
    Pedido.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Pedido cancelado com sucesso")
        res.redirect("pedidos")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao cancelar pedido")
        res.redirect("pedidos")
    })
})

module.exports = router