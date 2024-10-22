
const Logbook = require('../models/LogbookEntry');


exports.createLogbookEntry = async (req, res) => {
  try {
    const { patientName, date, mrNumber, patientInfo, type } = req.body;

    
    const logbookEntry = new Logbook({
      userId: req.user._id, 
      patientName,
      date,
      mrNumber,
      patientInfo,
      type
    });

    
    await logbookEntry.save();

    res.status(201).json({ message: 'Logbook entry created successfully', logbookEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error saving logbook entry', error });
  }
};
