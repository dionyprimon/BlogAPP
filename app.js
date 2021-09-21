//carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()

const path = require("path")
const mongoose = require('mongoose')
const { MongoServerClosedError } = require('mongodb')
const session = require("express-session")
const flash = require("connect-flash")

const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
app.use(express.static('public'))

require("./models/Produto")
const produtos = require("./routes/produto")

require("./models/Cliente")
const clientes = require("./routes/cliente")

require("./models/Categoria")
const categorias = require("./routes/categoria")

const catalogo = require("./routes/catalogo")

require("./models/Pedido")
const pedidos = require("./routes/pedido")

const db = require("./config/db")

//##############################################################



//##############################################################
//Configurações
//Sessão
app.use(session({
    secret: "çççççççççççç",
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
mongoose.connect(db.mongoURI).then(() => {
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
    next()
})

//##############################################################




//##############################################################
//Rotas HOME
app.get('/', (req, res) => {
    res.render("index")
})

//rota de erro
app.get("/404", (req, res) => {
    res.send('Erro 404!')
})

//rotas usuarios
app.use('/usuarios', usuarios)

//rota produtos
app.use('/produtos', produtos)

//rota clientes
app.use('/clientes', clientes)

//rota categorias
app.use('/categorias', categorias)

//rota categorias
app.use('/catalogo', catalogo)

//rota pedidos
app.use('/pedidos', pedidos)




//rota para login no sistema
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