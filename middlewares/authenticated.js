'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secretKey = 'encriptacion-STG4@'

exports.ensureAuth = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(403).send({message: "La peticion no tiene la cabecera de Autenticacion"})
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'El token ha expirado'})
            }
        }catch(err){
            return res.status(404).send({message: 'El token no es valido'})
        }
        req.user = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next) => {
    var payload = req.user;

    if(payload.role != 'ROLE_ADMIN'){
        return res.status(404).send({message: 'No se requieren permisos para acceder'})
    }else{
       return next(); 
    }
}