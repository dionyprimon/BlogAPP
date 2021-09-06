//carregando módulos
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const { eAdmin } = require("../helpers/eAdmin")


//rotas
router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina de posts")
})

//rota para listagem de categorias
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({ nome: 'asc' }).then((categorias) => {
        res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

//rota para o formulário de criar categoria
router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})


//rota e validação para criação uma nova categoria
router.post('/categorias/nova', eAdmin, (req, res) => {
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
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', "Categoria criada")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash('error_msg', "Erro ao criar categoria, tente novamente")
            res.redirect("/admin/categorias")
        })
    }
})

//rota para a tela de alterar categoria
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe.")
        res.redirect("/admin/categorias")
    })
})

//rota para aplicar as edições na categoria (está sem sistema de validação)
router.post("/categorias/edit/", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash('error_msg', "Erro ao editar categoria, tente novamente")
        res.redirect("/admin/categorias")
    })
})

//rota para a função deletar categorias
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

//rota para a pagina de postagens
router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: 'desc' }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as postagens")
        res.redirect("/admin/postagens")
    })
})

//rota para a pagina de criação de novas postagens e função para mostrar as categorias cadastradas
router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar o formulário")
        res.render("admin/postagens")
    })
})

//rota e validação para criação um novo post
router.post("/postagens/nova", eAdmin, (req, res) => {
    var erros = []
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Titulo invalido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "Descrição invalida" })
    }
    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida" })
    }
    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', "Postagem criada")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash('error_msg', "Erro ao criar postagem, tente novamente")
            res.redirect("/admin/postagens")
        })
    }
})

//rota para a tela de alterar postagem
router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe.")
        res.redirect("/admin/postagens")
    })
})

//rota para edição de um post
router.post("/postagens/edit", eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.categoria = req.body.categoria
        postagem.conteudo = req.body.conteudo

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar postagem")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash('error_msg', "Erro ao editar postagem, tente novamente")
        res.redirect("/admin/postagens")
    })
})

//rota para a função deletar postagens
router.post("/postagens/deletar", eAdmin, (req, res) => {
    Postagem.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar postagem")
        res.redirect("/admin/postagens")
    })
})













module.exports = router