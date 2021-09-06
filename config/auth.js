const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Model de usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport) {

    passport.use(new localStrategy({ usernameField: 'email', passwordField: "senha" }, (email, senha, done) => {

        Usuario.findOne({ email: email }).lean().then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe" })
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuario)
                } else {
                    return done(null, false, { message: "Senha incorreta" })
                }
            })

        })
    }))


    //salva os dados do usuario autenticado em uma seção
    passport.serializeUser((usuario, done) => {

        done(null, usuario)

    })

    passport.deserializeUser((id, done) => {

        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })

    })

}