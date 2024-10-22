const LogInCollection = require('../models/mongo'); 


const createLogbookEntry = async (req, res) => {
    const { patientName, Date, mrNumber, patientInfo, type } = req.body;

    
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

        
        const user = await LogInCollection.findById(req.user._id);
        user.logbooks.push(logbookEntry); 
        await user.save(); 

        res.status(201).json(logbookEntry);
    } catch (error) {
        console.error('Error creating logbook entry:', error);
        res.status(500).json({ message: 'Error creating logbook entry.' });
    }
};



const editLogbookEntry = async (req, res) => {
    const { id } = req.params;
    const { patientName, Date, issue, treatmentPlan, doctorNotes } = req.body;

    try {
        const logbookEntry = await LogbookEntry.findByIdAndUpdate(
            id,
            { patientName, Date, issue, treatmentPlan, doctorNotes },
            { new: true, runValidators: true } 
        );

        if (!logbookEntry) {
            return res.status(404).json({ message: 'Logbook entry not found.' });
        }

        res.status(200).json(logbookEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error updating logbook entry.' });
    }
};


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
