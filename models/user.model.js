'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var userSchema = Schema ({
    name: String,
    username: String,
    password: String,
    email: String,
    role: String,
    image: String,
    leagues: [{type: Schema.ObjectId, ref: "league"}]
})

module.exports = mongoose.model('user', userSchema)