//carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require('mongoose')
const { MongoServerClosedError } = require('mongodb')
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)


//##############################################################



//##############################################################
//Configurações
//Sessão
app.use(session({
    secret: "cursonodeççç",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log("Conectado ao MONGODB")
}).catch((err) => {
    console.log("Erro ao se conectar: " + err)
})

//##############################################################



//##############################################################
//Public
app.use(express.static(path.join(__dirname, 'public')))
    //Middleware
app.use((req, res, next) => {
    console.log("MIDDLEWARE ativado")
    next()
})

//##############################################################




//##############################################################
//Rotas HOME
app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: 'desc' }).then((postagens) => {
        res.render("index", { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as postagens")
        res.redirect("/404")
    })
})

//abre uma postagem em uma outra página
app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem: postagem })
        } else {
            req.flash('error_msg', "Houve um erro ao listar a postagem")
            res.redirect("/404")
        }
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro interno")
        res.redirect("/")
    })
})

//abre uma rota para lista de categorias
app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categorias/index', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/")
    })
})

//rota para uma lista de posts com filtro por categoria escolhida
app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {

            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {

                res.render("categorias/postagens", { postagens: postagens, categoria: categoria })

            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao filtrar os posts")
                res.redirect("/")
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao filtrar as categorias")
        res.redirect("/")
    })
})


//rota de erro
app.get("/404", (req, res) => {
    res.send('Erro 404!')
})

//Rotas ADM
app.use('/admin', admin)

//rotas Usuarios
app.use('/usuarios', usuarios)

app.get("/login", (req, res) => {
    res.render("usuarios/login")
})


//##############################################################





//##############################################################
//Outros
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log("SERVIDOR ON")
})

//##############################################################