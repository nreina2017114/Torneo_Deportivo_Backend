'user strict'

var User = require('../models/user.model');
var League = require('../models/league.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

var fs = require('fs');
var path = require('path');



////////////////////////// Administrador de inicio /////////////////////////////
function initAdmin(req, res){
    let user = new User();
    user.username = 'ADMIN'
    user.password = 'deportes123'

    User.findOne({username: user.username}, (err, adminFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(adminFind){
            return console.log('Usuario admin ya existente')
        }else{
            bcrypt.hash(user.password, null, null, (err, passwordHash)=>{
                if(err){
                    return res.status(500).send({message: 'Error al intentar comparar las contraseñas'})
                }else if(passwordHash){
                    user.password = passwordHash;
                    user.username = user.username;
                    user.role = 'ROLE_ADMIN';
                    user.save((err, userSaved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al guardar Administrador'})
                        }else if(userSaved){
                            return console.log('Administrador creado satisfactoriamente')
                        }else{
                            return res.status(500).send({message: 'Administrador no guardado'})
                        }
                    })
                }else{
                    return res.status(403).send({message: 'La encriptación de la contraseña falló'})
                }
            })
        }
    })
}




////////////////////////// Logearse En La Aplicacion /////////////////////////////
function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username}, (err, userFind) => {
            if(err){
                return res.status(500).send({message: "Error al buscar el usuario"})
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword) => {
                    if(err){
                        return res.status(500).send({message: "Error al comparar la contraseña"})
                    }else if(checkPassword){
                        if(params.gettoken = 'true'){
                            res.send({
                                message: "Usuario logeado",
                                token: jwt.createToken(userFind),
				                user: userFind
                                
                                
                            })
                        }else{
                            return res.send({ message: "Usuario logeado", userFind})
                        }
                    
                    }else{
                        return res.send({message: "Contraseña incorrecta"})
                    }
                
                })
            }else{
                return res.send({message: "Usuario no existente"})
            }
        }).populate([
            {
              path: "leagues",
              model: "league",
              populate:{
                path: 'teams',
                model: 'team',
                populate:{
                    path: 'leagueMatch',
                    model: 'match'
                }
              }
            },
          ])
    }else{
        return res.status(404).send({message: "Ingrese Username y contraseña"})
    }
}





////////////////////////// Registrarse En La Aplicacion  /////////////////////////////
function register(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.username && params.password && params.email){
        User.findOne({username: params.username}, (err, userFind) => {
            if(err){
                return res.status(404).send({message: 'Ocurrio un error al buscar el usuario'})
            }else if(userFind){
                return res.send({message: "Nombre no disponible, intenta con otro"})
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if(err){
                        return res.status(404).send({message: "La encriptación de la contraseña falló", err})
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.username = params.username;
                        user.email = params.email;
                        user.role = 'ROLE_USER';
                        user.image = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/cf2836cb-5893-4a6c-b156-5a89d94fc721/dcb12oy-f393b61a-0754-475a-8f2e-db06550f392a.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2NmMjgzNmNiLTU4OTMtNGE2Yy1iMTU2LTVhODlkOTRmYzcyMVwvZGNiMTJveS1mMzkzYjYxYS0wNzU0LTQ3NWEtOGYyZS1kYjA2NTUwZjM5MmEuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.yuSQQYbikFatv15ewUZmNDDxm7s3hBBYGJkUFUUF6rw'
                        user.save((err, userSaved) => {
                            if(err){
                                return res.status(404).send({message: "ocurrio un error al intentar guardar el usuario"})
                            }else if(userSaved){
                                return res.send({message: "Usuario creado satisfactoriamente",userSaved})
                            }else{
                                return res.status(403).send({message: "Error al intentar guardar Datos"})
                            }
                        })
                    }else{
                        return res.status(401).send({message: "la contraseña no encriptada"})
                    }
                })
            }
        })
    }else{
        return res.status(404).send({message: "Ingrese los datos minimos: Username, name, password, email."})
    }
}




////////////////////////// Obtener Usuarios  /////////////////////////////
function getUsers(req, res){
    User.find({}).populate('leagues').exec((err, users) => {
        if(err){
            return res.status(500).send({message: "Error al buscar los usuarios"})
        }else if(users){
            console.log(users)
            return res.send({message: "Usuarios encontrados", users})
        }else{
            return res.status(204).send({message: "No se encontraron usuarios"})
        }
    })
}




////////////////////////// Actualizar Usuario  /////////////////////////////
function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(401).send({ message: 'No posees permisos necesarios para realizar esta acción'});
    }else{
        if(update.password || update.role){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña ni el rol desde esta función'});
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(userFind){
                        if(userFind._id == req.user.sub){
                            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    League.updateMany({user: userId},  {username: update.username} , (err, updateLeagues)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al actualizar'});
                                        }else if(updateLeagues){
                                            console.log(updateLeagues)
                                            return res.send({message: 'Usuario actualizado', userUpdated});
                                        }else{
                                            return res.status(500).send({message: 'no se encontro'});
                                        }
                                    })
                                }else{
                                    return res.send({message: 'No se pudo actualizar al usuario'});
                                }
                            }).populate([
                                {
                                  path: "leagues",
                                  model: "league",
                                  populate:{
                                    path: 'teams',
                                    model: 'team'
                                  }
                                },
                              ])
                        }else{
                            return res.send({message: 'Nombre de usuario ya en uso'});
                        }
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                League.updateMany({user: userId},  {username: update.username} , (err, updateLeagues)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al actualizar'});
                                    }else if(updateLeagues){
                                        console.log(updateLeagues)
                                        return res.send({message: 'Usuario actualizado', userUpdated});
                                    }else{
                                        return res.status(500).send({message: 'no se encontro'});
                                    }
                                })
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        }).populate([
                            {
                              path: "leagues",
                              model: "league",
                              populate:{
                                path: 'teams',
                                model: 'team'
                              }
                            },
                          ])
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(userUpdated){
                        League.updateMany({user: userId},  {username: update.username} , (err, updateLeagues)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(updateLeagues){
                                console.log(updateLeagues)
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.status(500).send({message: 'no se encontro'});
                            }
                        })
                    }else{
                        return res.send({message: 'No se pudo actualizar al usuario'});
                    }
                }).populate([
                    {
                      path: "leagues",
                      model: "league",
                      populate:{
                        path: 'teams',
                        model: 'team'
                      }
                    },
                  ])
            }
        }
    }
    
}



//////////////////////////  Guardar Usuario en el Administrador  /////////////////////////////
function saveUserByAdmin(req, res){
    let user = new User();
    let params = req.body;

    if(params.name && params.username && params.password && params.email && params.role){
        User.findOne({username: params.username}, (err, userFind)=>{
            if(err){    
                return res.status(500).send({message: "Error al buscar un usuario"});
            }else if(userFind){
                return res.send({message: "Ya esta en uso este Username"});
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: "Error general"});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.username = params.username;
                        user.email = params.email;
                        user.role = params.role;
                        user.image = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/cf2836cb-5893-4a6c-b156-5a89d94fc721/dcb12oy-f393b61a-0754-475a-8f2e-db06550f392a.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2NmMjgzNmNiLTU4OTMtNGE2Yy1iMTU2LTVhODlkOTRmYzcyMVwvZGNiMTJveS1mMzkzYjYxYS0wNzU0LTQ3NWEtOGYyZS1kYjA2NTUwZjM5MmEuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.yuSQQYbikFatv15ewUZmNDDxm7s3hBBYGJkUFUUF6rw'
                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: "Error general 2"});
                            }else if(userSaved){
                                return res.send({message: "Usuario guardado correctamente: ", userSaved});
                            }else{
                                return res.status(500).send({message: "No se pudo guardar el usuario"});
                            }
                        })
                    }else{ 
                        return res.status(401).send({message: "Error con la encriptación"});
                    }
                })
            }
        })
    }else{
        return res.status(401).send({message: "Ingrese los datos minimos, porfavor"})
    }
}




//////////////////////////  Eliminar Usuario  /////////////////////////////
function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.send({message: 'No posees permisos necesarios para realizar esta acción'})
    }else{
        if(!params.password){
            return res.status(401).send({message: 'Por favor ingresa la contraseña para poder eliminar tu cuenta'});
        }else{
            User.findById(userId, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'})
                }else if(userFind){
                    bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                        if(err){
                            return res.send({message: 'Error general al verificar contraseña'})
                        }else if(checkPassword){
                            User.findByIdAndRemove(userId, (err, userFind)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al verificar contraseña'})
                                }else if(userFind){
                                    League.deleteMany({user: userId}, (err, deleteLeagues)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al actualizar'});
                                        }else if(deleteLeagues){
                                            return res.send({message: 'Usuario eliminado', userRemoved:userFind})
                                        }else{
                                            return res.status(500).send({message: 'no se encontro'});
                                        }
                                    })  
                                }else{
                                    return res.send({message: 'Usuario no encontrado o ya eliminado'})
                                }
                            })
                        }else{
                            return res.status(403).send({message: 'Contraseña incorrecta'})
                        }
                    })
                }else{
                    return res.send({message: 'Usuario inexistente o ya eliminado'})
                }
            })
        }
    }
}




//////////////////////////  Editar Usuario en el Administrador /////////////////////////////
function updateUserByAdmin(req, res){

    let userId = req.params.id;
    let update = req.body;


    if(update.password){
        return res.status(403).send({message: 'No tienes permisos para actualizar el contraseña'})
    }else{
        if(update.username){
            User.findOne({username: update.username}, (err, usernameFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar'})
                }else if(usernameFind){
                    return res.send({message: 'Nombre de usuario ya en uso'})
                }else{
                    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al actualizar'})
                        }else if(userUpdated){
                            League.updateMany({user: userId},  {username: update.username} , (err, updateLeagues)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(updateLeagues){
                                    
                                    return res.send({message: 'Usuario actualizado', userUpdated});
                                }else{
                                    return res.status(500).send({message: 'no se encontro'});
                                }
                            })
                        }else{
                            return res.status(401).send({message: 'No se actualizó el usuario'})  
                        }
                    })
                }
            })
        }else{
            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al actualizar'})
                }else if(userUpdated){
                    League.updateMany({user: userId},  {username: update.username} , (err, updateLeagues)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al actualizar'});
                        }else if(updateLeagues){
                            
                            return res.send({message: 'Usuario actualizado', userUpdated});
                        }else{
                            return res.status(500).send({message: 'no se encontro'});
                        }
                    })
                }else{
                    return res.status(401).send({message: 'No se actualizó el usuario'})  
                }
            })
        }
    }
}




//////////////////////////  Eliminar Usuario en el Administrador  /////////////////////////////
function removeUserByAdmin(req, res){
    let userId = req.params.id;

    User.findByIdAndRemove(userId, (err, userRemoved)=>{
        if(err){
            res.status(500).send({message: 'Error general al eliminar usuario'});
        }else if(userRemoved){
            League.deleteMany({user: userId}, (err, deleteLeagues)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al actualizar'});
                }else if(deleteLeagues){
                    res.status(200).send({message: 'Usuario eliminado', userRemoved});
                }else{
                    return res.status(500).send({message: 'no se encontro'});
                }
            })  
        }else{
            res.status(200).send({message: 'No existe registro del usuario deseado a eliminar'});  
        }       
    })
}

module.exports = {
    initAdmin,
    register,
    login,
    saveUserByAdmin,
    getUsers,
    updateUser,
    removeUser,
    updateUserByAdmin,
    removeUserByAdmin
}