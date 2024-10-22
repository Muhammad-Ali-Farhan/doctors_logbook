// controllers/logbookController.js
const Logbook = require('../models/LogbookEntry');

// Save a new logbook entry
exports.createLogbookEntry = async (req, res) => {
  try {
    const { patientName, date, mrNumber, patientInfo, type } = req.body;

    // Create new logbook entry
    const logbookEntry = new Logbook({
      userId: req.user._id, // Assuming user ID comes from authentication
      patientName,
      date,
      mrNumber,
      patientInfo,
      type
    });

    // Save to database
    await logbookEntry.save();

    res.status(201).json({ message: 'Logbook entry created successfully', logbookEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error saving logbook entry', error });
  }
};
