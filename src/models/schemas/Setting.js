let mongoose = require('mongoose')

let SettingSchema = new mongoose.Schema({
    nome: String,
    uuid: String
},{'collection':'setting'})

module.exports = SettingSchema