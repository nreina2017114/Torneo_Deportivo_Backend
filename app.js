'use strict'

// VARIABLES GLOBALES
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

// IMPORTACION DE RUTAS
var userRoutes = require('./routes/user.routes');
var leagueRoutes = require('./routes/league.routes');
var teamRoutes = require('./routes/team.routes');

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

// CABECERAS
app.use(cors())

// APLICACION DE RUTAS
app.use('/api', userRoutes);
app.use('/api', leagueRoutes);
app.use('/api', teamRoutes);

// EXPORTAR
module.exports = app;