const express = require('express');
const LogbookEntry = require('../models/LogbookEntry'); // Make sure to import your model
const auth = require('../middleware/auth'); // Import the auth middleware
const router = express.Router();
const logbookController = require('../controllers/logbookController');

router.post('/', logbookController.createLogbookEntry);
// Add a new logbook entry
router.post('/logbook', auth, async (req, res) => {
    const newLogbook = new LogbookEntry({
        patientName: req.body.patientName,
        date: req.body.date, // Ensure the date format is correct
        mrNumber: req.body.mrNumber,
        patientInfo: req.body.patientInfo,
        type: req.body.type,
        userId: req.user.id // Get the user ID from the token
    });

    try {
        const savedLogbook = await newLogbook.save();
        res.status(201).json(savedLogbook);
    } catch (err) {
        console.error('Error saving logbook:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get logbook entries for the authenticated user
router.get('/logbook', auth, async (req, res) => {
    try {
        const logbooks = await LogbookEntry.find({ userId: req.user.id }); // Find entries by user ID
        res.json(logbooks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get a specific logbook entry by ID
router.get('/logbook/:id', auth, async (req, res) => {
    try {
        const entry = await LogbookEntry.findOne({ _id: req.params.id, user: req.user._id });
        if (!entry) {
            return res.status(404).json({ message: 'Logbook entry not found.' });
        }
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logbook entry.' });
    }
});

// Update a logbook entry by ID
router.put('/logbook/:id', auth, async (req, res) => {
    const { patientName, Date, issue, treatmentPlan, doctorNotes } = req.body;

    // Input validation
    if (!patientName || !Date || !issue) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const entry = await LogbookEntry.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { patientName, Date, issue, treatmentPlan, doctorNotes },
            { new: true, runValidators: true } // Return the updated entry and validate
        );

        if (!entry) {
            return res.status(404).json({ message: 'Logbook entry not found or you do not have permission to edit this entry.' });
        }

        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Error updating logbook entry.' });
    }
});

// Delete a logbook entry by ID
// Delete a logbook entry by MR Number
router.delete('/logbook/mrNumber/:mrNumber', auth, async (req, res) => {
    try {
        const entry = await LogbookEntry.findOneAndDelete({ mrNumber: req.params.mrNumber, user: req.user._id });

        if (!entry) {
            return res.status(404).json({ message: 'Logbook entry not found or you do not have permission to delete this entry.' });
        }

        res.status(200).json({ message: 'Logbook entry deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting logbook entry.' });
    }
});

// Search logbook entries by patientName or mrNumber
// Search logbook entries by patient name or MR number
router.get('/logbook/search', auth, async (req, res) => {
    const { patientName, mrNumber } = req.query;

    // Build the query object
    const query = {};
    if (patientName) query.patientName = { $regex: patientName, $options: 'i' }; // Case-insensitive search
    if (mrNumber) query.mrNumber = mrNumber;

    try {
        const entries = await LogbookEntry.find({ ...query, user: req.user._id });
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logbook entries.' });
    }
});




module.exports = router;
