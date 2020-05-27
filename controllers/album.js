'use strict'

//Modulos
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

//Modelos
const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');

function getAlbum(req, res){
    const id = req.params.id;

    Album.findById(id).populate({path: 'artist'}).exec((err, album)=>{
        if(err){
            res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!album){
                res.status(404).send({
                    message: 'El album no existe!!'
                });
            }else{
                res.status(200).send({
                    album
                });
            }
        }
    })

}

function getAlbums(req, res){
    const artistId = req.params.artistId;

    if(!artistId){
        //Sacar todos los albums de la base de datos
        var find = Album.find({}).sort('title');
    }else{
        //Sacar los albums de una artista de la DB
        var find = Album.find({artist: artistId}).sort('year');;
    }

    find.populate({path: 'artist'}).exec((err, albums)=>{
        if(err){
            res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!albums){
                res.status(404).send({
                    message: 'El album no existe!!'
                });
            }else{
                res.status(200).send({
                    albums
                });
            }
        }
    })
}

function saveAlbum(req, res){
    const album = new Album();

    const body = req.body;

    album.title = body.title;
    album.des = body.des;
    album.year = body.year;
    album.img = null;
    album.artist = body.artist

    album.save((err, albumStored)=>{
        if(err){
            res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!albumStored){
                res.status(404).send({
                    message: 'No se aguardo el album correctamente!!'
                });
            }else{
                res.status(200).send({
                    album: albumStored
                });
            }
        }
    });
}

function updateAlbum(req, res){
    const id = req.params.id;
    const body = req.body;

    Album.findByIdAndUpdate(id, body, (err, albumUpdated) => {
        if(err){
            res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!albumUpdated){
                res.status(404).send({
                    message: 'No se a actulizado el album correctamente!!'
                });
            }else{
                res.status(200).send({
                    album: albumUpdated
                });
            }
        }
    });

}

function deleteAlbum(req, res){

    const id = req.params.id;

    Album.findByIdAndRemove(id, (err, albumRemove) => {
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
                                album: albumRemove
                            }); 
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    var albumId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.img.path;//Ruta de la imagen
		var file_split = file_path.split('\\');//Separador para obtener la ruta de la imagen
		var file_name = file_split[2];//Nombre el archivo

		var ext_split = file_name.split('\.');//Separador para obtener la extencion
		var file_ext = ext_split[1];//Obtenermos la extencion de la imagen

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			Album.findByIdAndUpdate(albumId, {img: file_name}, (err, albumUpdated) => {
				if(err){
					res.status(500).send({
						message: 'Error al actualizar usuario'
					});
				}else{
					if(!albumUpdated){
						res.status(404).send({message: 'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({album: albumUpdated, img: file_name});
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
	const path_file = './uploads/albums/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({message: 'La imagen no existe'});
		}
	});
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum, 
    deleteAlbum,
    uploadImage,
    getImageFile
}