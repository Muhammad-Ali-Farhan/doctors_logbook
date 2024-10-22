const mongoose = require('mongoose');


const logbookSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    patientName: { type: String, required: true },
    date: { type: Date, required: true },
    mrNumber: { type: Number, unique: true, required: true },
    patientInfo: { type: String, required: true },
    type: { type: String, required: true }
});


const LogInSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    logbooks: [logbookSchema],
});


const LogInCollection = mongoose.model('LogInCollection', LogInSchema);
const LogbookCollection = mongoose.model('Logbook', logbookSchema);

module.exports = { LogInCollection, LogbookCollection };
