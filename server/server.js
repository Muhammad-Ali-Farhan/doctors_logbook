const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const logbookRoutes = require('./routes/logbookRoutes');
const User = require('./models/User');
require('dotenv').config();
const { LogbookCollection, LogInCollection } = require('./mongo'); // Assuming you've set up models correctly

// Create the Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'some-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../client/views')); // Set up views directory
app.use(express.static(path.join(__dirname, '../client')));

// MongoDB connection
mongoose.connect('mongodb+srv://mohalifarhan:AXhBteYQw3M7om6M@clusterlog.vd93z.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLog', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Define the logbook schema and model



// Routes

// Home route
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/logbooks');
    } else {
        res.render('login'); // Render login view
    }
});

// Render login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Render signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// User signup route
// User signup route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    
    // Log the received username and password for debugging
    console.log('Signup request:', { username, password });

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, password }); // No need to hash here

    try {
        await user.save(); // Save user to database
        req.session.user = user; // Log user in after signing up
        res.redirect('/logbooks');
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Error saving user' });
    }
});


// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    req.session.user = user;
    res.redirect('/logbooks');
});

// Create logbook entry route
// Create logbook entry route
app.post('/api/logbooks', async (req, res) => {
    try {
        const { patientName, mrNumber, date, patientInfo, type } = req.body;

        // Create a new logbook entry
        const newLogbook = new LogbookCollection({
            userId: req.session.user._id, // Ensure the user is logged in
            patientName,
            mrNumber, // Ensure this is treated as a string
            date, // Ensure the date is correctly formatted
            patientInfo,
            type
        });
        console.log('Received date:', date);


        // Save the logbook entry to the database
        await newLogbook.save();
        res.status(201).json({ message: 'Entry added successfully!' });
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({ message: 'Error saving logbook entry' });
    }
});


// Get user logbooks route
app.get('/logbooks', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        const logbooks = await LogbookCollection.find({ userId: req.session.user._id });
        
        // Format logbooks for rendering
        const formattedLogbooks = logbooks.map(logbook => {
            console.log('Received logbook:', logbook);  // Log the logbook object for debugging
            return {
                ...logbook._doc,
                date: logbook._doc.date ? new Date(logbook._doc.date).toISOString().split('T')[0] : 'Date not available', // Safeguard for undefined dates
                mrNumber: logbook.mrNumber // Ensure MR number is treated as a string
            };
        });
        
        

        res.render('logbooks', { logbooks: formattedLogbooks });
    } catch (error) {
        console.error('Error fetching logbooks:', error);
        res.status(500).send('Error fetching logbooks.');
    }
});


// Edit logbook entry route
app.post('/logbooks/edit/:mrNumber', async (req, res) => {
    const { patientName, patientInfo, type } = req.body;
    const { mrNumber } = req.params;

    try {
        const logbook = await LogbookCollection.findOneAndUpdate(
            { mrNumber },
            { patientName, patientInfo, type },
            { new: true }


        );

        if (!logbook) {
            return res.status(404).json({ message: 'Logbook not found' });
        }

        res.redirect('/logbooks');
    } catch (error) {
        console.error('Error editing logbook:', error);
        res.status(500).json({ message: 'Error editing logbook' });
    }
});

// Delete logbook route
// Backend route for deleting logbook entry
// Ensure this part of your code correctly references the LogbookCollection
// Delete logbook route
app.delete('/api/logbooks/:mrNumber', async (req, res) => {
    const { mrNumber } = req.params;

    try {
        // Convert mrNumber to a number for the query, assuming mrNumber is stored as a number in the database
        const result = await LogbookCollection.deleteOne({ mrNumber: Number(mrNumber) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Logbook entry deleted successfully' });
        } else {
            res.status(404).json({ error: 'Logbook entry not found' });
        }
    } catch (error) {
        console.error('Error deleting logbook entry:', error);
        res.status(500).json({ error: 'Failed to delete logbook entry' });
    }
});






// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.redirect('/');
    });
});










// Search logbook by MR number
// Search logbook route
app.get('/api/logbooks/search', async (req, res) => {
    const { patientName, mrNumber } = req.query;

    try {
        let query = { userId: req.session.user._id }; // Ensure the user is logged in

        if (patientName) {
            query.patientName = { $regex: patientName, $options: 'i' }; // Case-insensitive search
        }

        if (mrNumber) {
            query.mrNumber = mrNumber; // Match exact MR Number
        }

        const logbooks = await LogbookCollection.find(query);

        res.json(logbooks);
    } catch (error) {
        console.error('Error searching logbooks:', error);
        res.status(500).json({ error: 'Failed to search logbooks' });
    }
});

// Assuming you have a Mongoose model for logbooks

// Fetch logbook entries and send to the frontend
app.get('/api/logbooks', async (req, res) => {
    try {
        const logbooks = await LogbookCollection.find({ userId: req.user._id });

        // Format the dates before sending the response
        const formattedLogbooks = logbooks.map(logbook => {
            console.log('Received logbook:', logbook);  // Log the logbook object for debugging
            return {
                ...logbook._doc,
                date: logbook._doc.date ? new Date(logbook._doc.date).toISOString().split('T')[0] : 'Date not available', // Safeguard for undefined dates
                mrNumber: logbook.mrNumber // Ensure MR number is treated as a string
            };
        });
        

        res.status(200).json(formattedLogbooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching logbook entries' });
    }
});


const hbs = require('hbs');

// Register the formatDate helper
hbs.registerHelper('formatDate', function(date) {
    console.log('Formatting date:', date); // Debugging line
    if (!date) return '';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Invalid Date';
    const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Format: day month year
    return parsedDate.toLocaleDateString('en-US', options);
});



// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
