'use strict'

const mongoose = require('mongoose');
const app = require('./app');

//Configuracion del puerto
const port = process.env.PORT || 3000;

//Conexion a la DB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/music', { useUnifiedTopology:true, useNewUrlParser: true }) 
		.then(() => {
			app.listen(port, () => {
				console.log('Escuchando en el puerto http://localhost:'+port);
			});
		}).catch(err => console.log(err));