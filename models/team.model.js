'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = Schema({
    name: String,
    image: String,
    count: Number,
    leagueMatch: [{type: Schema.ObjectId, ref: "match"}],
    league: {type: Schema.ObjectId, ref:"league"}
})

module.exports = mongoose.model('team', teamSchema)