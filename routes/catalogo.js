//carregando módulos
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Usuario")
const { eAdmin } = require("../helpers/eAdmin")

require("../models/Categoria")
const Categoria = mongoose.model("categorias")

require('../models/Produto')
const Produto = mongoose.model('produtos')


//ROTAS

//rota para pagina do catalogo
router.get('/catalogo', (req, res) => {
    Produto.find().lean().sort({ nome: 'asc' }).then((produtos) => {
        Categoria.find().lean().sort({ nome: 'asc' }).then((categorias) => {
            res.render('catalogo', { categorias: categorias, produtos: produtos })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao montar o catalogo")
            res.redirect("catalogo")
        })
    }).catch((err) => {
        req.flash("error_msg", "Um erro interno ocorreu ao tentar gerar o catalogo.")
        res.redirect("catalogo")
    })
})

//rota para pagina do catalogo com filtro por categoria escolhida
router.get("/itemfilter/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categorias) => {
        if (categorias) {

            Produto.find({ categoria: categorias._id }).lean().sort({ nome: 'asc' }).then((produtos) => {

                res.render("catalogo/filtro", { produtos: produtos, categorias: categorias })

            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao filtrar os produtos")
                res.redirect("catalogo")
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("catalogo")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao filtrar as categorias")
        res.redirect("catalogo")
    })
})


module.exports = router