if (process.env.NODE_ENV == "production") {
    module.exports = { mongoURI: "mongodb+srv://admin:diony12345@startrade.qxtrm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}