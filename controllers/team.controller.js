'use strict'

var League = require('../models/league.model');
var Team = require('../models/team.model');
var User = require('../models/user.model')
var Match = require('../models/mach.model');
const machModel = require('../models/mach.model');




////////////////////////// Equipo  por Default/////////////////////////////
function teamdefault(req, res){
    let team = new Team();
    team.name = 'default'

    Team.findOne({name: team.name}, (err, teamfind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al crear el equipo «default»'});
        }else if(teamfind){
            return console.log('Equipo «default» creado exitosamente');
        }else{
            team.save((err, teamdefaultSaved)=>{
                if(err){
                    return res.status(500).send({message: 'Error general durante la creación del equipo'});
                }else if(teamdefaultSaved){
                    return console.log('Equipo «default» creado exitosamente');
                }else{
                    return res.status(204).send({message: 'No se pudo crear el equipo'});
                }
            })
        }
    })
}



////////////////////////// Establecer Equipo /////////////////////////////
function setTeam(req, res){
    var leagueId = req.params.id;
    var userId = req.params.idU;
    var params = req.body;
    var team = new Team();

    League.findById(leagueId, (err, leagueFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al implementar el equipo'});
        }else if(leagueFind){
            team.name = params.name;
            team.image = params.image;
            team.count = params.count;
            team.league = leagueId; 
            team.save((err, teamSaved)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al implementar el equipo'});
                }else if(teamSaved){
                    console.log(leagueFind)
                    League.findByIdAndUpdate(leagueId, {$push:{teams: teamSaved._id}}, {new: true}, (err, pushTeam)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al implementar el equipo'});
                        }else if(pushTeam){
                            User.findById(userId, (err, userFind)=>{
                                if(err){
                                    console.log('error')
                                }else if(userFind){
                                    return res.send({message: 'Se implemento el equipo correctamente', pushTeam, userFind});
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
                            return res.status(404).send({message: 'No se encontro el equipo para implementar'});
                        }
                    }).populate('teams')
                }else{
                    return res.status(404).send({message: 'No se pudieron realizar los cambios de implementación'});
                }
            })
        }else {
            return res.status(404).send({message: 'La liga no existe'});
        }
    })
}




////////////////////////// Actualizar Equipo /////////////////////////////
function updateTeam(req, res){
    let userId = req.params.idU;
    let leagueId = req.params.idL;
    let teamId = req.params.idT;   
    let params = req.body;


    if(params.name || params.image){
        League.findOne({_id: leagueId, teams: teamId}, (err, leagueFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al actualizar el equipo'});
            }else if(leagueFind){
                Team.findByIdAndUpdate(teamId, params, {new: true}, (err, updateTeam)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar el equipo'});
                    }else if(updateTeam){
                        Match.updateMany({idTeam: teamId}, params, (err, updateMatch)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar el equipo'});
                            }else if(updateMatch){
                                return res.send({message: 'Se actualizó correctamente el equipo', updateMatch});
                            }else{
                                return res.send({message: 'No se pudo actualizar el equipo'});
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No se pudo actualizar el equipo'});
                    }
                })
            }else{
                return res.status(404).send({message: 'Esta liga no existe, por lo tanto no se puede actualizar'});
            }
        })
    }else{
        return res.status(404).send({message: 'Ingresa los datos mínimos para poder actualizar'});    
    }
}



////////////////////////// Actualizar Marcador /////////////////////////////
function updateMach(req, res){
    let teamId = req.params.idT; 
    let leagueId = req.params.idL;   
    let params = req.body;
    var match = new Match();
    var matchL = new Match();


    if(params.goals == params.goalsf){
        Team.findById(teamId, (err, teamFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al actualizar el emparejamiento'});
            }else if(teamFind){
                Match.findOne({idMatch: params.idMatch, idTeam: teamId}, (err, matchfind)=>{
                   if(err){
                    return res.status(500).send({message: 'Error general al actualizar el emparejamiento'});
                   }else if(matchfind){
                        match._id = matchfind._id;
                        match.goals =  matchfind.goals + params.goals;
                        match.goalsf = matchfind.goalsf + params.goalsf;
                        match.matchCount = matchfind.matchCount + params.matchCount;
                        match.idMatch = params.idMatch
                        match.value = matchfind.value + 1;
                        Match.findByIdAndUpdate(matchfind._id, match, {new: true}, (err, updateTeam)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar el emparejamiento'});
                            }else if(updateTeam){
                                Team.findById(params.idLoser, (err, teamLoserFind)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al actualizar el emparejamiento'});
                                    }else if(teamLoserFind){
                                        Match.findOne({idMatch: params.idMatch, idTeam: teamLoserFind._id}, (err, matchLoserfind)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                            }else if(matchLoserfind){
                                                matchL._id = matchLoserfind._id;
                                                matchL.goals = matchLoserfind.goals + params.goalsf;
                                                matchL.goalsf = matchLoserfind.goalsf + params.goals;
                                                matchL.matchCount = matchLoserfind.matchCount + params.matchCount;
                                                matchL.value = matchLoserfind.value + 1;
                                                matchL.idMatch = params.idMatch;
                                                console.log(matchL)
                                                Match.findByIdAndUpdate(matchLoserfind._id, matchL, {new: true}, (err, updateTeamL)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                    }else if(updateTeamL){
                                                        return res.send({message: 'El emparejamiento fue añadido exitosamente',updateTeamL});
                                                    }else{
                                                        return res.send({message: 'Error al actualizar el el equipo derrotado'});
                                                    }
                                                })
                                            }else{
                                                matchL.goals = params.goalsf;
                                                matchL.goalsf = params.goals;
                                                matchL.matchCount = params.matchCount;
                                                matchL.idTeam = teamLoserFind._id;
                                                matchL.name = teamLoserFind.name;
                                                matchL.idLeague = leagueId;
                                                matchL.idMatch = params.idMatch;
                                                matchL.value = 1;
                                                matchL.save((err, matchLSaved)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                    }else if(matchLSaved){
                                                        Team.findByIdAndUpdate(params.idLoser, {$push:{leagueMatch: matchLSaved._id}}, {new: true}, (err, pushLMatch)=>{
                                                            if(err){
                                                                return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                            }else if(pushLMatch){
                                                                return res.send({message: 'El emparejamiento fue añadido exitosamente',pushLMatch});
                                                            }else{
                                                                return res.status(500).send({message: 'No se pudo agregar al equipo derrotado'});   
                                                            }
                                                        })
                                                    }else{  
                                                        return res.send({message: 'Error al guardar el emparejamiento'});           
                                                    }
                                                })
                                            }
                                        })
                                    }else{
                                        return res.send({message: 'Ocurrió un error al encontrar al equipo derrotado'});  
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'No se puedo actualizar el emparejamiento del equipo ganador'});
                            }
                            })
                    }else{
                        match.goals = params.goals;
                        match.goalsf = params.goalsf;
                        match.matchCount = params.matchCount;
                        match.idTeam = teamId;
                        match.name = teamFind.name;
                        match.idMatch = params.idMatch;
                        match.idLeague = leagueId;
                        match.value = 1;
                        match.save((err, matchSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                            }else if(matchSaved){
                                Team.findByIdAndUpdate(teamId, {$push:{leagueMatch: matchSaved._id}}, {new: true}, (err, pushMatch)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                    }else if(pushMatch){
                                        console.log(params.idLoser)
                                        Team.findById(params.idLoser, (err, teamLoserFind)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                            }else if(teamLoserFind){
                                                Match.findOne({idMatch: params.idMatch, idTeam: teamLoserFind._id}, (err, matchLoserfind)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                    }else if(matchLoserfind){
                                                        matchL._id = matchLoserfind._id;
                                                        matchL.goals = matchLoserfind + params.goalsf;
                                                        matchL.goalsf = matchLoserfind + params.goals
                                                        matchL.matchCount = matchLoserfind.matchCount + params.matchCount;
                                                        matchL.value = matchLoserfind.value+1;
                                                        matchL.idMatch = params.idMatch;
                                                        Match.findByIdAndUpdate(matchLoserfind._id, matchL, {new: true}, (err, updateTeamL)=>{
                                                            if(err){
                                                                return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                            }else if(updateTeamL){
                                                                return res.send({message: 'El emparejamiento fue ectualizado de manera exitosa',updateTeamL});
                                                            }else{
                                                                return res.send({message: 'Error al actualizar el emparejamiento'});
                                                            }
                                                        })
                                                    }else{
                                                        matchL.goals = params.goalsf;
                                                        matchL.goalsf = params.goals;
                                                        matchL.matchCount = params.matchCount;
                                                        matchL.idTeam = params.idLoser
                                                        matchL.name = teamLoserFind.name;
                                                        matchL.idLeague = leagueId;
                                                        matchL.idMatch = params.idMatch;
                                                        matchL.value = 1;
                                                        matchL.save((err, matchLSaved)=>{
                                                            if(err){
                                                                return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                            }else if(matchLSaved){
                                                                Team.findByIdAndUpdate(params.idLoser, {$push:{leagueMatch: matchLSaved._id}}, {new: true}, (err, pushLMatch)=>{
                                                                    if(err){
                                                                        return res.status(500).send({message: 'Error al actualizar el emparejamiento'});
                                                                    }else if(pushLMatch){
                                                                        return res.send({message: 'se agrego exitosamente el partido',pushLMatch});
                                                                    }else{
                                                                        return res.send({message: 'No se puedo actualizar el emparejamiento'});
                                                                    }
                                                                })
                                                            }else{
                                                                return res.send({message: 'No se puedo actualizar el emparejamiento'});
                                                            }
                                                        })
                                                    }
                                                })
                                            }else{
                                                return res.send({message: 'No se puedo actualizar el emparejamiento'});
                                            }
                                        })
                                    }else{
                                        return res.send({message: 'No se puedo actualizar el emparejamiento del equipo derrotado'});
                                    }
                                })
                            }else{
                                return res.send({message: 'No se puedo guardar el emparejamiento'});
                            }
                        })
                    }
               })
            }else{
                return res.status(404).send({message: 'No existe este equipo que se solicitud'});
            }
        })


    }else{

    Team.findById(teamId, (err, teamFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al buscar al equipo'});
        }else if(teamFind){
           Match.findOne({idMatch: params.idMatch, idTeam: teamId}, (err, matchfind)=>{
               if(err){
                return res.status(500).send({message: 'Error general al buscar al equipo'});
               }else if(matchfind){
                    match._id = matchfind._id;
                    match.goals =  matchfind.goals + params.goals;
                    match.goalsf = matchfind.goalsf + params.goalsf;
                    match.matchCount = matchfind.matchCount + params.matchCount;
                    match.idMatch = params.idMatch
                    match.value = matchfind.value + 3;
                    Match.findByIdAndUpdate(matchfind._id, match, {new: true}, (err, updateTeam)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al buscar al equipo'});
                        }else if(updateTeam){
                            Team.findById(params.idLoser, (err, teamLoserFind)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al buscar al equipo'});
                                }else if(teamLoserFind){
                                    Match.findOne({idMatch: params.idMatch, idTeam: teamLoserFind._id}, (err, matchLoserfind)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al buscar al equipo'});
                                        }else if(matchLoserfind){
                                            matchL._id = matchLoserfind._id;
                                            matchL.goals = matchLoserfind.goals + params.goalsf;
                                            matchL.goalsf = matchLoserfind.goalsf + params.goals;
                                            matchL.matchCount = matchLoserfind.matchCount + params.matchCount;
                                            matchL.value = matchLoserfind.value;
                                            matchL.idMatch = params.idMatch;
                                            console.log(matchL)
                                            Match.findByIdAndUpdate(matchLoserfind._id, matchL, {new: true}, (err, updateTeamL)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al buscar al equipo derrotado'});
                                                }else if(updateTeamL){
                                                    return res.send({message: 'El partido fue actualizado exitosamente',updateTeamL});
                                                }else{
                                                    return res.send({message: 'Error general al buscar'});
                                                }
                                            })
                                        }else{
                                            matchL.goals = params.goalsf;
                                            matchL.goalsf = params.goals;
                                            matchL.matchCount = params.matchCount;
                                            matchL.idTeam = teamLoserFind._id;
                                            matchL.name = teamLoserFind.name;
                                            matchL.idLeague = leagueId;
                                            matchL.idMatch = params.idMatch;
                                            matchL.value = 0;
                                            matchL.save((err, matchLSaved)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al buscar al equipo'});
                                                }else if(matchLSaved){
                                                    Team.findByIdAndUpdate(params.idLoser, {$push:{leagueMatch: matchLSaved._id}}, {new: true}, (err, pushLMatch)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al buscar al equipo derrotado'});
                                                        }else if(pushLMatch){
                                                            return res.send({message: 'El partido fuer agregado de manera exitosa',pushLMatch});
                                                        }else{
                                                            return res.send({message: 'Error general al guardar'});
                                                        }
                                                    })
                                                }else{
                                                    return res.send({message: 'Error general al guardar el emparejamiento'});
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    return res.send({message: 'Error general al buscar al equipo derrotado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'No fue posible actualizar al equipo'});
                        }
                        })
                }else{
                    match.goals = params.goals;
                    match.goalsf = params.goalsf;
                    match.matchCount = params.matchCount;
                    match.idTeam = teamId;
                    match.name = teamFind.name;
                    match.idLeague = leagueId;
                    match.idMatch = params.idMatch;
                    match.value = 3;
                    match.save((err, matchSaved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al guardar el emparejamiento'});
                        }else if(matchSaved){
                            Team.findByIdAndUpdate(teamId, {$push:{leagueMatch: matchSaved._id}}, {new: true}, (err, pushMatch)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar el emparejamiento'});
                                }else if(pushMatch){
                                    console.log(params.idLoser)
                                    Team.findById(params.idLoser, (err, teamLoserFind)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al encontrar al equipo derrotado'});
                                        }else if(teamLoserFind){
                                            Match.findOne({idMatch: params.idMatch, idTeam: teamLoserFind._id}, (err, matchLoserfind)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al encontrar al equipo derrotado'});
                                                }else if(matchLoserfind){
                                                    matchL._id = matchLoserfind._id;
                                                    matchL.goals = matchLoserfind + params.goalsf;
                                                    matchL.goalsf = matchLoserfind + params.goals
                                                    matchL.matchCount = matchLoserfind.matchCount + params.matchCount;
                                                    matchL.value = matchLoserfind.value;
                                                    matchL.idMatch = params.idMatch;
                                                    Match.findByIdAndUpdate(matchLoserfind._id, matchL, {new: true}, (err, updateTeamL)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al encontrar al equipo derrotado'});
                                                        }else if(updateTeamL){
                                                            return res.send({message: 'El partido fue agregado de manera exitosa',updateTeamL});
                                                        }else{
                                                            return res.send({message: 'No fue posible actualizar el partido'});
                                                        }
                                                    })
                                                }else{
                                                    matchL.goals = params.goalsf;
                                                    matchL.goalsf = params.goals;
                                                    matchL.matchCount = params.matchCount;
                                                    matchL.idTeam = params.idLoser
                                                    matchL.name = teamLoserFind.name;
                                                    matchL.idLeague = leagueId;
                                                    matchL.idMatch = params.idMatch;
                                                    matchL.value = 0;
                                                    matchL.save((err, matchLSaved)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al guardar el emparejamiento'});
                                                        }else if(matchLSaved){
                                                            Team.findByIdAndUpdate(params.idLoser, {$push:{leagueMatch: matchLSaved._id}}, {new: true}, (err, pushLMatch)=>{
                                                                if(err){
                                                                    return res.status(500).send({message: 'Error general al encontrar al equipo derrotado'});
                                                                }else if(pushLMatch){
                                                                    return res.send({message: 'El partido fue agregado de manera exitosa',pushLMatch});
                                                                }else{
                                                                    return res.send({message: 'No fue posible actualizar el partido'});
                                                                }
                                                            })
                                                        }else{
                                                            return res.send({message: 'No fue posible guardar el partido'});
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            return res.send({message: 'No fue posible actualizar el partido'});    
                                        }
                                    })
                                }else{
                                    return res.send({message: 'No fue posible guardar el partido'});
                                }
                            })
                        }else{
                            return res.send({message: 'No fue posible guardar el partido'});
                        }
                    })
                }
           })
        }else{
            return res.status(404).send({message: 'El equipo seleccionado no existe'});
        }
    })
}


}




////////////////////////// Eliminar Equipo /////////////////////////////
function removeTeam(req,res){
    let leagueId = req.params.idL;
    let teamId = req.params.idT;

    League.findByIdAndUpdate({_id: leagueId, teams: teamId}, {$pull: {teams: teamId}}, {new:true}, (err, teamPull)=>{
        if(err){
            return res.status(500).send({message: 'Error general al eliminar al equipo'})
        }else if(teamPull){
            Team.findByIdAndRemove(teamId, (err, teamRemove)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al eliminar al equipo', err})
                }else if(teamRemove){
                    Match.deleteMany({idTeam: teamId}, (err, matchdelete)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar al equipo'})
                        }else if(matchdelete){
                            return res.send({message: 'Se eliminó el equipo: ', matchdelete});
                        }else{
                            return res.send({message: 'No se pudo eliminar el equipo'})
                        }
                    })
                    
                }else{
                    return res.status(404).send({message: 'No se pudo eliminar el equipo'})
                }
            })
        }else{
            return res.status(404).send({message: 'No se pudo realizar esta acción debido a que el equipo no existe'})
        }
    }).populate('teams')
}




////////////////////////// Obtener Equipos ////////////////////////////
function getTeams(req, res){
    Team.find({}).populate('leagues').exec((err, teams)=>{
        if(err){
            return res.status(500).send({message: 'Error general al intentar visualizar los equipos', err})
        }else if(teams){
            return res.send({message: 'Equipos encontrados de manera exitosa', teams})
        }else{
            return res.status(404).send({message: 'No hay registros de equipos disponibles'})
        }
    })
}



////////////////////////// Obtener Marcadores /////////////////////////////
function getMatches(req, res){
    let leagueId = req.params.idL; 
    var params = req.body;

    Match.find({idLeague:leagueId, idMatch: params.idMatch }).exec((err, matches) => {
        if(err){
            return res.status(500).send({message: "Error general al buscar los usuarios"})
        }else if(matches){
            console.log(matches)
            Team.find({league: leagueId}).countDocuments((err, countTeams)=>{
                if(err){
                    return res.status(500).send({message: "Error general al buscar los usuarios"})
                }else if(countTeams){
                    console.log(countTeams)
                    return res.send({message: "Usuarios encontrados exitosamente", matches, countTeams})
                }else{
                    return res.status(204).send({message: "No se encontraron usuarios durante la busqueda"})
                }
            })
            
        }else{
            return res.status(204).send({message: "No se encontraron usuarios"})
        }
    })
}




////////////////////////// Obtener Marcadores por el Administrador /////////////////////////////
function getMatchesAdmin(req, res){
    Match.find({}).exec((err, matches)=>{
        if(err){
            return res.status(204).send({message: "Error al realizar la busqueda de los emparejamientos"})
        }else if(matches){
            return res.send({message: "Emparejamientos encontrados exitosamente: ", matches})
        }else{
            return res.status(204).send({message: "No se encontraron emparejamientos durante la busqueda"})
        }
    })
}

module.exports = {
    teamdefault,
    setTeam,
    updateTeam,
    removeTeam,
    getTeams,
    updateMach,
    getMatches,
    getMatchesAdmin
}