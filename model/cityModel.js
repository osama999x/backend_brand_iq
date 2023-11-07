const { string } = require('joi');
const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    status:{
        type: Boolean,
        default: true
    },
},{timestamps:true});
const cityModel = mongoose.model('City', citySchema);

module.exports = cityModel;
