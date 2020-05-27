'use strict'

//Modulos
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

//Modelos
const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');

function getArtist(req, res){
    const id = req.params.id;

    Artist.findById(id, (err, artist) => {
        if(err){
            res.status(500).send({
                message: 'Error al comprobar el usuario'
            });
        }else{
            if(!artist){
                res.status(404).send({
                    message: 'Error en guardar al usuario'
                });
            }else{
                res.status(200).send({
                    artist
                })
            }
        }
    });

}

function getArtits(req, res){

    if(req.params.page){
        const page = req.params.page;
    }else{
        var page = 1;
    }
    
    const itemsByPage = 5;

    Artist.find().sort('name').paginate(page, itemsByPage, function(err, artists, total) {
        if(err){
            res.status(500).send({
                message: 'Error al peticion'
            });
        }else{
            if(!artists){
                res.status(404).send({
                    message: 'No hay artistas!!'
                });
            }else{
                res.status(200).send({
                    total_items: total,
                    artists
                })
            }
        }
    });


}

function saveArtist(req, res){
    const artist = new Artist();

    const body = req.body;
    artist.name = body.name;
    artist.des = body.des;
    artist.img = 'null';

    artist.save((err, artist) => {
        if(err){
            res.status(500).send({
                message: 'Error al guardar el usuario'
            });
        }else{
            if(!artist){
                res.status(404).send({
                    message: 'El usuario no se pudo guardar correctamente'
                });
            }else{
                res.status(200).send({
                    artist
                })
            }
        }
    });

}

function updateArtist(req, res){
    const id = req.params.id;
    const body = req.body;

    Artist.findByIdAndUpdate(id, body, (err, artist) => {
        if(err){
            res.status(500).send({
                message: 'Error al actualizar al artista'
            });
        }else{
            if(!artist){
                res.status(404).send({
                    message: 'El artista no se pudo actualizar correctamente'
                });
            }else{
                res.status(200).send({
                    artist
                })
            }
        }
    });
}

function deleteArtist(req, res){

    const id = req.params.id;

    Artist.findByIdAndRemove(id, (err, artistRemove) => {
        if(err){
            res.status(500).send({
                message: 'Error al eliminar al artista'
            });
        }else{
            if(!artistRemove){
                res.status(404).send({
                    message: 'El artista no se pudo eliminar correctamente'
                });
            }else{
                Album.find({artist: artistRemove._id}).remove((err, albumRemove) => {
                    if(err){
                        res.status(500).send({
                            message: 'Error al eliminar al album'
                        });
                    }else{
                        if(!albumRemove){
                            res.status(404).send({
                                message: 'El artista no se pudo eliminar el album correctamente'
                            });
                        }else{
                            Song.find({album: albumRemove._id}).remove((err, songRemove) => {
                                if(err){
                                    res.status(500).send({
                                        message: 'Error al eliminar la cancion'
                                    });
                                }else{
                                    if(!songRemove){
                                        res.status(404).send({
                                            message: 'No se pudo eliminar la cancion correctamente'
                                        });
                                    }else{
                                        res.status(200).send({
                                            artist: artistRemove
                                        }); 
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    })

}

function uploadImage(req, res){
    var artistId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.img.path;//Ruta de la imagen
		var file_split = file_path.split('\\');//Separador para obtener la ruta de la imagen
		var file_name = file_split[2];//Nombre el archivo

		var ext_split = file_name.split('\.');//Separador para obtener la extencion
		var file_ext = ext_split[1];//Obtenermos la extencion de la imagen

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			Artist.findByIdAndUpdate(artistId, {img: file_name}, (err, artistUpdated) => {
				if(err){
					res.status(500).send({
						message: 'Error al actualizar usuario'
					});
				}else{
					if(!artistUpdated){
						res.status(404).send({message: 'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({artist: artistUpdated, img: file_name});
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

function getImageFile(req, res){
	const imageFile = req.params.imageFile;
	const path_file = './uploads/artists/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({message: 'La imagen no existe'});
		}
	});
}

module.exports = {
    getArtist,
    saveArtist,
    getArtits,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}