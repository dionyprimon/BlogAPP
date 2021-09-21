//carregando módulos
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')
const bcrypt = require("bcryptjs")
const passport = require("passport")
const { eAdmin } = require("../helpers/eAdmin")


//############################################################################
// FUNÇÕES FORA DO SISTEMA (deslogado)

//rota para o formulário de login
router.get("/login", (req, res) => {
    res.render("usuarios/login")
})


//rota para a função login
router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

//rota para o formulário de cadastro de usuarios pela pagina principal
router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

//rota e função de cadastro do usuario pela pagina principal, com validações dos campos de senha
router.post("/registro", (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null) {
        erros.push({ texto: "Confirmação de senha inválida" })
    }
    if (req.body.senha.leght < 4) {
        erros.push({ texto: "Senha muito curta" })
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente" })
    }
    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros })
    } else {

        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail registrado")
                res.redirect("/usuarios/registro")
            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    // eAdmin: 1
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuario, tente novamente")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})



// #########################################################
// FUNÇÕES DENTRO DO SISTEMA (COM O LOGIN FEITO)

//rota para o formulário de administração dos usuários / COM FUNÇÃO DE LISTAR TODOS OS USUÁRIOS
router.get('/admuser', eAdmin, (req, res) => {
    Usuario.find().lean().sort({ nome: 'asc' }).then((usuarios) => {
        res.render("usuarios/admuser", { usuarios: usuarios })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar os usuários")
        res.redirect("/")
    })
})

//rota para o formulário de cadastro de usuarios pela pagina de administração de usuários
router.get("/adminregistro", eAdmin, (req, res) => {
    res.render("usuarios/adminregistro")
})

//rota e função de cadastro do usuario pela pagina de administração de usuários, com validações dos campos de senha
router.post("/adminregistro", eAdmin, (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null) {
        erros.push({ texto: "Confirmação de senha inválida" })
    }
    if (req.body.senha.leght < 4) {
        erros.push({ texto: "Senha muito curta" })
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente" })
    }
    if (erros.length > 0) {
        res.render("adminregistro", { erros: erros })
    } else {

        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail registrado")
                res.redirect("adminregistro")
            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                        // eAdmin: 1
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect("admuser")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect("admuser")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuario, tente novamente")
                            res.redirect("adminregistro")
                        })

                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("adminregistro")
        })
    }
})

//rota para o formulário de alteração de usuarios pela pagina de administração de usuários
router.get("/editusuario/:id", eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).lean().then((usuario) => {
        res.render("usuarios/editusuario", { usuario: usuario })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao entrar na página de edição de usuário")
        res.redirect("/admuser")
    })
})

//rota e função de alteração do usuario pela pagina de administração de usuários, sem alterar a senha
router.post("/editusuario/", eAdmin, (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null) {
        erros.push({ texto: "Confirmação de senha inválida" })
    }
    if (req.body.senha.leght < 4) {
        erros.push({ texto: "Senha muito curta" })
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente" })
    }
    if (erros.length > 0) {
        res.render("/usuarios/admuser", { erros: erros })
    } else {

        Usuario.findOne({ _id: req.body.id }).then((usuario) => {

            usuario.nome = req.body.nome
            usuario.email = req.body.email
            usuario.senha = req.body.senha

            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                    if (erro) {
                        req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                        res.redirect("/usuarios/admuser")
                    }

                    usuario.senha = hash

                    usuario.save().then(() => {
                        req.flash("success_msg", "Usuario editado com sucesso")
                        res.redirect("/usuarios/admuser")
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao editar o usuario, tente novamente")
                        res.redirect("/usuarios/admuser")
                    })

                })
            })
        })
    }
})

//rota para a função deletar usuarios
router.post("/usuarios/deletar", eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.body.id }).then((usuario) => {
        if (usuario.eAdmin == '1') {
            req.flash("error_msg", "Este usuário não pode ser excluido por ser o ADM do sistema")
            res.redirect("/usuarios/admuser")
        } else {
            Usuario.deleteOne({ _id: req.body.id }).then(() => {
                req.flash("success_msg", "Usuário deletado com sucesso")
                res.redirect("/usuarios/admuser")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao deletar usuário")
                res.redirect("/usuarios/admuser")
            })
        }

    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar usuário")
        res.redirect("/usuarios/admuser")
    })
})


//rota para fazer logout do sistema
router.get("/logout", (req, res) => {
    req.logout()
    req.flash('success_msg', "Deslogado com sucesso")
    res.redirect("/")
})

module.exports = router