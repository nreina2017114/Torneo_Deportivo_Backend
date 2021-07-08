'user strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var leagueSchema = Schema ({
    name: String,
    count: Number,
    image: String,
    teams: [{type: Schema.ObjectId, ref: "team"}],
    user: String,
    username: String
})

module.exports = mongoose.model('league', leagueSchema);