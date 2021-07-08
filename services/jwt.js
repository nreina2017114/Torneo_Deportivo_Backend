'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secretKey = 'encriptacion-STG4@'

exports.createToken = (user) => {
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(5, 'days').unix()
    }
    return jwt.encode(payload, secretKey)
}