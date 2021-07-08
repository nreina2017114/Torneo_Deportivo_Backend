'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MatchSchema = Schema({
    idMatch: Number,
    goals: Number,
    goalsf: Number,
    matchCount: Number,
    idTeam: String,
    value: Number,
    name: String,
    idLeague: String
})

module.exports = mongoose.model('match', MatchSchema)
