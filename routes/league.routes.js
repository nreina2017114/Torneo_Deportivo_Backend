'use strict'

// IMPORTACIONES
var express = require('express');
var leagueController = require('../controllers/league.controller');

// IMPORTACION MIDDLEWARES PARA RUTAS
var mdAuth = require('../middlewares/authenticated');

// RUTAS
var api = express.Router();
api.put('/saveLeague', mdAuth.ensureAuth, leagueController.saveLeague);
api.put('/:idU/updateLeague/:idL', mdAuth.ensureAuth, leagueController.updateLeague);
api.put('/:idU/removeLeague/:idL', mdAuth.ensureAuth, leagueController.removeLeague);
api.post('/search', mdAuth.ensureAuth, leagueController.searchLeague);
api.put('/:id/setLeague', mdAuth.ensureAuth, leagueController.setLeague);
api.put('/getLeague/:idL', mdAuth.ensureAuth, leagueController.getleague)
api.get('/getleagues', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],leagueController.getLeagues)

// EXPORTAR
module.exports = api;