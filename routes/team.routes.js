'use strict'

// IMPORTACIONES
var express = require('express');
var teamController = require('../controllers/team.controller');

// IMPORTACION MIDDLEWARES PARA RUTAS
var mdAuth = require('../middlewares/authenticated');

// RUTAS
var api = express.Router();
api.put('/:idU/:id/setTeam', mdAuth.ensureAuth, teamController.setTeam);
api.put('/:idL/updateTeam/:idT/:idU', mdAuth.ensureAuth,  teamController.updateTeam);
api.put('/:idL/removeTeam/:idT', mdAuth.ensureAuth,  teamController.removeTeam);
api.get('/getTeams', mdAuth.ensureAuth,  teamController.getTeams);
api.put('/:idL/updateMach/:idT', mdAuth.ensureAuth,  teamController.updateMach);
api.put('/getMatches/:idL', mdAuth.ensureAuth,  teamController.getMatches);
api.get('/getMatchesAdmin', mdAuth.ensureAuth,  teamController.getMatchesAdmin);

// EXPORTAR
module.exports = api;