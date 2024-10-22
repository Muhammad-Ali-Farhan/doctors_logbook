const LogInCollection = require('../models/mongo'); // Ensure you import your model

// Create a logbook entry
const createLogbookEntry = async (req, res) => {
    const { patientName, Date, mrNumber, patientInfo, type } = req.body;

    // Input validation
    if (!patientName || !Date || !mrNumber || !type) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const logbookEntry = {
            patientName,
            Date,
            mrNumber,
            patientInfo,
            type,
            
        };

        // Find the user and save the logbook entry
        const user = await LogInCollection.findById(req.user._id);
        user.logbooks.push(logbookEntry); // Add entry to user's logbooks array
        await user.save(); // Save the user document

        res.status(201).json(logbookEntry);
    } catch (error) {
        console.error('Error creating logbook entry:', error);
        res.status(500).json({ message: 'Error creating logbook entry.' });
    }
};


// Edit a logbook entry
const editLogbookEntry = async (req, res) => {
    const { id } = req.params;
    const { patientName, Date, issue, treatmentPlan, doctorNotes } = req.body;

    try {
        const logbookEntry = await LogbookEntry.findByIdAndUpdate(
            id,
            { patientName, Date, issue, treatmentPlan, doctorNotes },
            { new: true, runValidators: true } // Return the updated entry and validate
        );

        if (!logbookEntry) {
            return res.status(404).json({ message: 'Logbook entry not found.' });
        }

        res.status(200).json(logbookEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error updating logbook entry.' });
    }
};

// Delete a logbook entry
const deleteLogbookEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const logbookEntry = await LogbookEntry.findByIdAndDelete(id);

        if (!logbookEntry) {
            return res.status(404).json({ message: 'Logbook entry not found.' });
        }

        res.status(200).json({ message: 'Logbook entry deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting logbook entry.' });
    }
};

module.exports = { createLogbookEntry, editLogbookEntry, deleteLogbookEntry };
