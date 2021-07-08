'user strict'

var User = require('../models/user.model');
var League = require('../models/league.model');
var Team = require('../models/team.model');



////////////////////////// Obtener por Liga  /////////////////////////////
function getleague(req, res){
    let leagueId = req.params.idL; 

    League.findOne({_id:leagueId}, (err, leagueFind)=>{
        if(err){
            return res.status(500).send({message: "Ha ocurrido un error al realizar la busqueda de usuarios"})
        }else if(leagueFind){console.log(leagueFind)
            return res.send({message: "Los usuarios han sido encontrados exitosamente", leagueFind})
            
        }else{
            return res.status(204).send({message: "No se ha encontrado ningún usuario"})
        }
    }).populate('teams')
}



////////////////////////// Crear Liga por Defecto /////////////////////////////
function createDefault(req, res){
    let league = new League();
    
    league.name = 'default';

    League.findOne({name: league.name}, (err, leagueFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al realizar la creación'})
        }else if(leagueFind){
            return console.log('La liga «Default» ha sido creada exitosamente');
        }else {
            league.save((err, leagueSaved)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al guardar la liga'})
                }else if(leagueSaved){
                    return console.log('La liga «Default» ha sido creada exitosamente');
                }else{
                    return res.status(500).send({message: 'La liga no ha sido creada'})
                }
            })
        }
    })
}




////////////////////////// Crear Liga /////////////////////////////
function saveLeague(req, res){
    var league = new League();
    var params = req.body;

    if(params.name || params.description){
        League.findOne({name: params.name}, (err, leagueFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al guardar la liga'});
            }else if(leagueFind){
                res.send({message: 'Esta liga ya existe'});
            }else{
                league.name = params.name;

                league.save((err, leagueSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al guardar la liga'})
                    }else if(leagueSaved){
                        return res.send({message: 'La liga ha sido creada exitosamentee', leagueSaved})
                    }else {
                        return res.status(403).send({message: 'La liga no ha sido creada'}) 
                    }
                })

            }
        })
    }else {
        return res.status(404).send({message: 'Por favor llenar todos los campos requeridos'});
    }
}




////////////////////////// Buscar Liga /////////////////////////////
function searchLeague(req, res){
    var params = req.body;

        if(params.search){
            League.find({$or:[{name: params.search}]}, (err, resultsSearch)=>{
                if(err){
                    return res.status(500).send({message: 'Error General'});
                }else if(resultsSearch){
                    return res.send({resultsSearch})
                }else{
                    return res.status(404).send({message: 'No hay registros de liga por mostrar'});
                }
        })
    }else{
        return res.status(403).send({message: 'Ingresar nombre para buscar la liga'})
    }
}




////////////////////////// Establecer Liga /////////////////////////////
function setLeague(req, res){
    var userId = req.params.id;
    var params = req.body;
    var league = new League();
    var team = new Team();

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general el realizar la busqueda'});
            }else if(userFind){
                league.name = params.name;
                league.image = params.image;
                league.count = '0';
                league.user = userId;
                league.username = userFind.username;
                league.save((err, leagueSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al intentar guardar'});
                    }else if(leagueSaved){
                        User.findByIdAndUpdate(userId, {$push:{leagues: leagueSaved._id}}, {new: true}, (err, pushLeague)=>{
                            if(err){
                                return res.status(500).send({message: 'Error al implementar la liga'});
                            }else if(pushLeague){
                                League.findById(leagueSaved._id, (err, leagueFind)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general durante la implementación'});
                                    }else if(leagueFind){
                                        Team.findOne({name:'default'}, (err, teamdefault)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general durante la implementación'});
                                            }else if(teamdefault){
                                                League.findByIdAndUpdate(leagueSaved._id, {$push:{teams: teamdefault._id}}, {new: true}, (err, pushTeam)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al realizar los cambios'});
                                                    }else if(pushTeam){
                                                        User.findById(userId, (err, userFind2)=>{
                                                            if(err){
                                                            }else if(userFind2){
                                                                return res.send({message: 'Se implemento correctamente el equipo', pushTeam, userFind2, pushLeague});
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
                                                        return res.status(404).send({message: 'No se encontro ningun dato similar'});
                                                    }
                                                })
                                            }else{

                                            }
                                        })
                                    }else {
                                        return res.status(404).send({message: 'Esta liga no existe'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'Error al implementar, cambios realizados en la base de datos'});
                            }
                        }).populate('leagues')
                    }else{
                        return res.status(404).send({message: 'Error al guardar'});
                    }
                })

            }else{
                return res.status(404).send({message: 'Falta de datos para implementar'});
            }
        })
    }
}




////////////////////////// Eliminar Liga /////////////////////////////
function removeLeague(req, res){
    let userId = req.params.idU;
    let leagueId = req.params.idL;

        User.findOneAndUpdate({_id: userId, leagues: leagueId},
            {$pull: {leagues: leagueId}}, {new:true}, (err, leaguePull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'})
                }else if(leaguePull){
                    League.findByIdAndRemove(leagueId, (err, leagueRemoved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general durante la eliminación', err})
                        }else if(leagueRemoved){
                            return res.send({message: 'Liga eliminada de manera exitosa', leaguePull});
                        }else{
                            return res.status(404).send({message: 'Liga no encontrada o ya eliminada'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'No se puede eliminar por falta de datos'})
                }
            }).populate('leagues')
   
}




////////////////////////// Actualizar Liga /////////////////////////////
function updateLeague(req, res){
    let userId = req.params.idU;
    let leagueId = req.params.idL;
    let update = req.body;

        if(update.name){
            User.findOne({_id: userId, leagues: leagueId}, (err, userLeague)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al actualizar'});
                }else if(userLeague){
                    
                    League.findByIdAndUpdate(leagueId, update, {new: true}, (err, updateLeague)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al actualizar la liga'});
                        }else if(updateLeague){
                            User.findOne({_id: userId, leagues: leagueId}, (err, userLeagueAct)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar la liga'});
                                }else if(userLeagueAct){
                                    return res.send({message: 'Liga actualizada exitosamente', userLeagueAct});
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
                            return res.status(401).send({message: 'No se pudo actualizar la liga'});
                        }
                    })
                }else{
                    return res.status(404).send({message: 'La liga no existe o ya ha sido actualizada'});
                }
            }).populate('leagues')
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para poder actualizar la liga'});
        }       
   
}




////////////////////////// Obtener Todas las  Ligas  /////////////////////////////
function getLeagues(req, res){
    League.find({}).exec((err, leagues) => {
        if(err){
            return res.status(500).send({message: "Error al buscar las ligas"})
        }else if(leagues){
            console.log(leagues)
            return res.send({message: "Las ligas han sido encontradas", leagues})
        }else{
            return res.status(204).send({message: "No se encontraron las ligas"})
        }
    })
}


module.exports = {
    createDefault,
    saveLeague,
    updateLeague,
    removeLeague,
    searchLeague,
    setLeague,
    getleague,
    getLeagues
}