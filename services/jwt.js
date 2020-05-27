'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'mi_clave_secreta';

exports.createToken = function(user){
	var payload = {
		sub: user._id,
		name: user.name,
		surname: user.surname,
		email: user.email,
		role: user.role,
		img: user.img,
		iat: moment().unix(),
		exp: moment().add(30, 'days').unix
	};

	return jwt.encode(payload, secret);
};