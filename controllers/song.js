'use strict'

//Modulos
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

//Modelos
const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');

//Metodos o acciones
function getSong(req, res){

    const id = req.params.id;

    Song.findById(id).populate({path: 'album'}).exec((err, song)=>{
        if(err){
            res.status(500).send({
                message: 'Error en la peticion'
            })
        }else{
            if(!song){
                res.status(404).send({
                    message: 'La cancion no existe'
                })
            }else{
                res.status(200).send({
                    song
                })
            }
        }
    });

}

function getSongs(req, res){
    const albumId = req.params.albumId;

    if(!albumId){
        var find = Song.find({}).sort('number');
    }else{
        var find = Song.find({album:albumId}).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs)=>{
        if(err){
            res.status(500).send({
                message: 'Error en la peticion'
            })
        }else{
            if(!songs){
                res.status(404).send({
                    message: 'No hay cancion'
                })
            }else{
                res.status(200).send({
                    songs
                })
            }
        }
    });

}

function saveSong(req, res){
    const song = new Song();

    const body = req.body;

    song.number = body.number;
    song.name = body.name;
    song.duration = body.duration;
    song.file = null;
    song.album = body.album;

    song.save((err, songStored) => {
        if(err){
            res.status(500).send({
                message: 'Error al guardar el usuario'
            });
        }else{
            if(!songStored){
                res.status(404).send({
                    message: 'No se ha guardado la cancion'
                });
            }else{
                res.status(200).send({
                    song: songStored
                });
            }
        }
    });
}

function updateSong(req, res){
    const id = req.params.id;
    const body = req.body;

    Song.findOneAndUpdate(id, body, (err, updateSong) => {
        if(err){
            res.status(500).send({
                message: 'Error en la peticion'
            })
        }else{
            if(!updateSong){
                res.status(404).send({
                    message: 'No hay cancion'
                })
            }else{
                res.status(200).send({
                    song: updateSong
                })
            }
        }
    });

}

function deleteSong(req, res){
    const id = req.params.id;

    Song.findByIdAndDelete(id, (err, deleteSong) => {
        if(err){
            res.status(500).send({
                message: 'Error en la peticion'
            })
        }else{
            if(!deleteSong){
                res.status(404).send({
                    message: 'No hay cancion'
                })
            }else{
                res.status(200).send({
                    song: deleteSong
                })
            }
        }
    });
}

function uploadFile(req, res){
    var songId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.file.path;//Ruta de la imagen
		var file_split = file_path.split('\\');//Separador para obtener la ruta de la imagen
		var file_name = file_split[2];//Nombre el archivo

		var ext_split = file_name.split('\.');//Separador para obtener la extencion
		var file_ext = ext_split[1];//Obtenermos la extencion de la imagen

		if(file_ext == 'mp3'){

			Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
				if(err){
					res.status(500).send({
						message: 'Error al actualizar usuario'
					});
				}else{
					if(!songUpdated){
						res.status(404).send({message: 'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({song: songUpdated, file: file_name});
					}
				}
			});

		}else{
			fs.unlink(file_path, (err) => {
				if(err){
					res.status(200).send({message: 'Extensión no valida y fichero no'});
				}else{
					res.status(200).send({message: 'Extensión no valida'});
				}
			});
		}

	}else{
		res.status(200).send({message: 'No se han subido archivos'});
	}

}

function getSongFile(req, res){
	const imageFile = req.params.songFile;
	const path_file = './uploads/songs/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({message: 'La cancion no existe'});
		}
	});
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}