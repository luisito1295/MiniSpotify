'use strict'

//Modulos
var bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const path = require('path');

//Modelos
var User = require('../models/user');

//Servicio jwt
const jwt = require('../services/jwt');

//Acciones o metodos
function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controller User'
    });
}

function saveUser(req, res){
    //Crear el objeto modelo
    let user = new User();
    //Recoger los parametros
	var params = req.body;

    if(params.password && params.name && params.surname && params.email){
        
        //Asignar valores al objeto usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.img = null;

        //Validar si el usuario existe
        User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
            if(err){
                res.status(500).send({
                    message: 'Error al comprobar el usuario'
                });
            }else{
                if(!issetUser){
                    //Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, function(err, hash){
                        user.password = hash

                        //Guardar el usuario en la DB
                        user.save((err, user) => {
                            if(err){
                                res.status(500).send({
                                    message: 'Error en guardar al usuario'
                                });
                            }else{
                                if(!user){
                                    res.status(404).send({
                                        message: 'Error en guardar al usuario'
                                    });
                                }else{
                                    res.status(200).send({
                                        user
                                    });
                                }
                            }
                        });
                    });
                }else{
                    res.status(200).send({
                        message: 'El usuario ya existe, use otro'
                    })
                }
            }
        })

    }else{
        res.status(200).send({
            message: 'Introduce todos los datos'
        });
    }
}

function login(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()}, (err, user) => {
			if(err){
				res.status(500).send({
                    message: 'Error al comprobar el usuario'
                });
			}else{
				if(!user){
                    res.status(404).send({
                        message: 'El usuario no existe'
                    });
				}else{
                    bcrypt.compare(password, user.password, (err, check) => {
                        if(check){
                            //Comprobar y generar el token
                            if(params.gettoken){
                                //Devolver el token
                                res.status(200).send({
                                    token: jwt.createToken(user)
                                });
                            }else{
                                res.status(200).send({
                                    user
                                });
                            }
                            
                        }else{
                            res.status(404).send({
                                message: 'El usuario no ha podido logearse correctamente'
                            });
                        }
                    });
				}
			}
	});

}

function updateUser(req, res){
    const id = req.params.id;
    const body = req.body;

    if(id != req.user.sub){
        return res.status(500).send({
            message: 'No tienes permiso para actualiar el usuario'
        });
    }

    User.findByIdAndUpdate(id, body, (err, user) => {
        if(err){
            res.status(500).send({
                message: 'Error al actualizar el usuario'
            });
        }else{
            if(!user){
                res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
            }else{
                res.status(200).send({
                    user
                })
            }
        }
    });
}

function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.img.path;//Ruta de la imagen
		var file_split = file_path.split('\\');//Separador para obtener la ruta de la imagen
		var file_name = file_split[2];//Nombre el archivo

		var ext_split = file_name.split('\.');//Separador para obtener la extencion
		var file_ext = ext_split[1];//Obtenermos la extencion de la imagen

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			User.findByIdAndUpdate(userId, {img: file_name}, (err, userUpdated) => {
				if(err){
					res.status(500).send({
						message: 'Error al actualizar usuario'
					});
				}else{
					if(!userUpdated){
						res.status(404).send({message: 'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({img: file_name, user: userUpdated, img: file_name});
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
	const path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({message: 'La imagen no existe'});
		}
	});
}

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile
}