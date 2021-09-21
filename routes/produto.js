//carregando módulos
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const { eAdmin } = require("../helpers/eAdmin")

require('../models/Produto')
const Produto = mongoose.model('produtos')

require("../models/Categoria")
const Categoria = mongoose.model("categorias")

//ROTAS

//rota para listagem de produtos
router.get('/listaprodutos', (req, res) => {
    Produto.find().lean().sort({ nome: 'asc' }).then((produtos) => {
        res.render("produtos/index", { produtos: produtos })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar os produtos")
        res.redirect("/")
    })
})

//rota para o formulário de cadastrar produtos + select para o formulário exibir as categorias cadastradas previamente
router.get('/addproduto', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("produtos/addproduto", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar o formulário")
        res.render("produtos/index")
    })
})

//rota e validação para o cadastro de um novo produto
router.post('/novoproduto', (req, res) => {
    //validações no preenchimento do formulário
    //validação do campo nome
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    //validação do campo valor unitário
    if (!req.body.valor || typeof req.body.valor == undefined || req.body.valor == null) {
        erros.push({ texto: "Valor invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da produto é muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("listaprodutos", { erros: erros })
    } else {
        const novoProduto = {
            nome: req.body.nome,
            categoria: req.body.categoria,
            valor: req.body.valor
        }
        new Produto(novoProduto).save().then(() => {
            req.flash('success_msg', "Produto cadastrado")
            res.redirect("listaprodutos")
        }).catch((err) => {
            req.flash('error_msg', "Erro ao cadastrar produto, tente novamente")
            res.redirect("listaprodutos")
        })
    }
})

//rota para a tela de consulta de um produto
router.get("/consultaproduto/:id", (req, res) => {

    Produto.findOne({ _id: req.params.id }).lean().then((produtos) => {
        Categoria.find({ _id: produtos.categoria }).lean().then((categorias) => {
            res.render('produtos/consultaproduto', { categorias: categorias, produtos: produtos })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("listaprodutos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe.")
        res.redirect("listaprodutos")
    })
})

//rota para a tela de alterar produto
router.get("/editproduto/:id", (req, res) => {

    Produto.findOne({ _id: req.params.id }).lean().then((produtos) => {
        Categoria.find().lean().then((categorias) => {
            res.render('produtos/editproduto', { categorias: categorias, produtos: produtos })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("listaprodutos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe.")
        res.redirect("listaprodutos")
    })
})

//rota e validação para alteração de um produto
router.post('/editaproduto/', (req, res) => {
    //validações no preenchimento do formulário
    //validação do campo nome
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    //validação do campo valor unitário
    if (!req.body.valor || typeof req.body.valor == undefined || req.body.valor == null) {
        erros.push({ texto: "Valor invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da produto é muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("listaprodutos", { erros: erros })
    } else {

        Produto.findOne({ _id: req.body.id }).then((produtos) => {

            produtos.nome = req.body.nome
            produtos.valor = req.body.valor
            produtos.categoria = req.body.categoria

            produtos.save().then(() => {
                req.flash("success_msg", "Produto editado com sucesso")
                res.redirect("/produtos/listaprodutos")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar produto")
                res.redirect("/produtos/listaprodutos")
            })

        }).catch((err) => {
            req.flash('error_msg', "Erro ao editar produto, tente novamente")
            res.redirect("/produtos/listaprodutos")
        })
    }
})

//rota para a função deletar produto
router.post("/deletaproduto", eAdmin, (req, res) => {
    Produto.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Produto deletado com sucesso")
        res.redirect("/produtos/listaprodutos")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar produto")
        res.redirect("/produtos/listaprodutos")
    })
})


module.exports = router