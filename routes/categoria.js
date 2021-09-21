//carregando módulos
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Usuario")
const { eAdmin } = require("../helpers/eAdmin")

require("../models/Categoria")
const Categoria = mongoose.model("categorias")



//### ROTAS ###

//rota para listagem de categorias
router.get('/listacategorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({ nome: 'asc' }).then((categorias) => {
        res.render("categorias/index", { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as categorias")
        res.redirect("/listacategorias")
    })
})

// //rota para o formulário de criar categoria
router.get('/addcategorias', eAdmin, (req, res) => {
    res.render("categorias/addcategoria")
})

//rota e validação para criação uma nova categoria
router.post('/criacategoria', eAdmin, (req, res) => {
    //validações no preenchimento do formulário
    //validação do campo nome
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    //validação do campo slug
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("listacategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', "Categoria criada")
            res.redirect("listacategorias")
        }).catch((err) => {
            req.flash('error_msg', "Erro ao criar categoria, tente novamente")
            res.redirect("listacategorias")
        })
    }
})

//rota para a tela de alterar categoria
router.get("/editcat/:id", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('categorias/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe.")
        res.redirect("listacategorias")
    })
})

//rota para aplicar as edições na categoria (está sem sistema de validação)
router.post("/editacateg", eAdmin, (req, res) => {
    
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    //validação do campo slug
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("listacategorias", { erros: erros })
    } else {
    
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso")
                res.redirect("listacategorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar categoria")
                res.redirect("listacategorias")
            })

        }).catch((err) => {
            req.flash('error_msg', "Erro ao editar categoria, tente novamente")
            res.redirect("listacategorias")
        })
    }
})

//rota para a função deletar categorias
router.post("/deletacateg", eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("listacategorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria")
        res.redirect("listacategorias")
    })
})




















module.exports = router