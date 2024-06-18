var mongoose = require('mongoose')
var Schema = mongoose.Schema

var teacherSchema = new mongoose.Schema({
    teacherName: { type: String, required: false },
    shortName: { type: String, required: false },
    designation: { type: String, required: false },
    faculty: { type: String, required: false },
    year: { type: [Number], required: false }

}, { timestamps: true });



module.exports = mongoose.model('Teacher', teacherSchema)