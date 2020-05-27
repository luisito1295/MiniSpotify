'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtistSchema = Schema({
    name: String,
    des:String,
    img:String
});

module.exports = mongoose.model('Artist', ArtistSchema);
