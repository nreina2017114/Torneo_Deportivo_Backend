'use strict'

// IMPORTACIONES
var express = require('express');
var userController = require('../controllers/user.controller');

// IMPORTACION MIDDLEWARES PARA RUTAS
var mdAuth = require('../middlewares/authenticated');

// RUTAS
var api = express.Router();
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers);
api.post('/register', userController.register);
api.post('/login', userController.login);
api.put('/updateUser/:id', mdAuth.ensureAuth, userController.updateUser);
api.delete('/deleteUser/:id', mdAuth.ensureAuth, userController.removeUser);
api.post('/saveUserByAdmin',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.saveUserByAdmin);
api.put('/updateUserByAdmin/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.updateUserByAdmin);
api.delete('/removeUserByAdmin/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.removeUserByAdmin);

// EXPORTAR
module.exports = api;