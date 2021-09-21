//carregando módulos
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const { eAdmin } = require("../helpers/eAdmin")

require('../models/Cliente')
const Cliente = mongoose.model('clientes')


//ROTAS

//rota para listagem de clientes
router.get('/listaclientes', (req, res) => {
    Cliente.find().lean().sort({ nome: 'asc' }).then((clientes) => {
        res.render("clientes/index", { clientes: clientes })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar os clientes")
        res.redirect("/")
    })
})

//rota para o formulário de cadastrar clientes
router.get('/addcliente', (req, res) => {
    res.render("clientes/addcliente")
})

//rota e validação para o cadastro de um novo cliente
router.post('/novocliente', (req, res) => {
    //validações no preenchimento do formulário
    //validação do campo nome
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    //validação do campo telefone
    if (!req.body.fone || typeof req.body.fone == undefined || req.body.fone == null) {
        erros.push({ texto: "Telefone invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome do cliente é muito curto, algo de errado deve ter" })
    }
    if (erros.length > 0) {
        res.render("listaclientes", { erros: erros })
    } else {
        const novoCliente = {
            nome: req.body.nome,
            telefone: req.body.fone,
            email: req.body.email
        }
        new Cliente(novoCliente).save().then(() => {
            req.flash('success_msg', "Cliente cadastrado")
            res.redirect("listaclientes")
        }).catch((err) => {
            req.flash('error_msg', "Erro ao cadastrar o cliente, tente novamente")
            res.redirect("listaclientes")
        })
    }
})

//rota para a tela de CONSULTA cliente
router.get("/consultacliente/:id", (req, res) => {
    Cliente.findOne({ _id: req.params.id }).lean().then((clientes) => {
        res.render('clientes/consultacliente', { clientes: clientes })
    }).catch((err) => {
        req.flash("error_msg", "Este cliente não existe.")
        res.redirect("/clientes/listaclientes")
    })
})

//rota para a tela de alterar cliente
router.get("/editcliente/:id", (req, res) => {
    Cliente.findOne({ _id: req.params.id }).lean().then((clientes) => {
        res.render('clientes/editcliente', { clientes: clientes })
    }).catch((err) => {
        req.flash("error_msg", "Este cliente não existe.")
        res.redirect("/clientes/listaclientes")
    })
})

//rota e validação para a edição de um novo cliente
router.post('/editacliente/', (req, res) => {
    //validações no preenchimento do formulário
    //validação do campo nome
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    //validação do campo telefone
    if (!req.body.fone || typeof req.body.fone == undefined || req.body.fone == null) {
        erros.push({ texto: "Telefone invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome do cliente é muito curto, algo de errado deve ter" })
    }
    if (erros.length > 0) {
        res.render("listaclientes", { erros: erros })
    } else {

        Cliente.findOne({ _id: req.body.id }).then((clientes) => {

            clientes.nome = req.body.nome
            clientes.telefone = req.body.fone
            clientes.email = req.body.email

            clientes.save().then(() => {
                req.flash("success_msg", "Cliente editado com sucesso")
                res.redirect("listaclientes")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar o cliente, tente novamente")
                res.redirect("listaclientes")
            })

        }).catch((err) => {
            req.flash('error_msg', "Erro ao editar o cliente, tente novamente")
            res.redirect("listaclientes")
        })
    }
})

//rota para a função deletar cliente
router.post("/deletacliente", eAdmin, (req, res) => {
    Cliente.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Cliente deletado com sucesso")
        res.redirect("listaclientes")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar cliente")
        res.redirect("listaclientes")
    })
})


module.exports = router