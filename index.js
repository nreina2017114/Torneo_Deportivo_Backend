'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var user = require('./controllers/user.controller')
var teamInit = require('./controllers/team.controller')
var port = 3800;


mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb+srv://admin:admin@cluster0.9qvg3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        user.initAdmin();
        teamInit.teamdefault();
        console.log('Conexion correcta a la base de datos');
        app.listen(process.env.PORT || port, ()=>{
            console.log('EL servidor esta corriendo en el puerto' + port)
        })
    })
    .catch((err)=>console.log('connection error to database', err))