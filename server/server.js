const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const logbookRoutes = require('./routes/logbookRoutes');
const User = require('./models/User');
require('dotenv').config();
const { LogbookCollection, LogInCollection } = require('./mongo'); 


const app = express();
const cors = require('cors');
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'some-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../client/views')); 
app.use(express.static(path.join(__dirname, '../client')));


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));








app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/logbooks');
    } else {
        res.render('login'); 
    }
});


app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/signup', (req, res) => {
    res.render('signup');
});



app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    
    
    console.log('Signup request:', { username, password });

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, password }); 

    try {
        await user.save(); 
        req.session.user = user; 
        res.redirect('/logbooks');
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Error saving user' });
    }
});



app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    req.session.user = user;
    res.redirect('/logbooks');
});



app.post('/api/logbooks', async (req, res) => {
    try {
        const { patientName, mrNumber, date, patientInfo, type } = req.body;

        
        const newLogbook = new LogbookCollection({
            userId: req.session.user._id, 
            patientName,
            mrNumber, 
            date, 
            patientInfo,
            type
        });
        console.log('Received date:', date);


        
        await newLogbook.save();
        res.status(201).json({ message: 'Entry added successfully!' });
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({ message: 'Error saving logbook entry' });
    }
});



app.get('/logbooks', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        const logbooks = await LogbookCollection.find({ userId: req.session.user._id });
        
        
        const formattedLogbooks = logbooks.map(logbook => {
            console.log('Received logbook:', logbook);  
            return {
                ...logbook._doc,
                date: logbook._doc.date ? new Date(logbook._doc.date).toISOString().split('T')[0] : 'Date not available', 
                mrNumber: logbook.mrNumber 
            };
        });
        
        

        res.render('logbooks', { logbooks: formattedLogbooks });
    } catch (error) {
        console.error('Error fetching logbooks:', error);
        res.status(500).send('Error fetching logbooks.');
    }
});



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





app.delete('/api/logbooks/:mrNumber', async (req, res) => {
    const { mrNumber } = req.params;

    try {
        
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







app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.redirect('/');
    });
});












app.get('/api/logbooks/search', async (req, res) => {
    const { patientName, mrNumber } = req.query;

    try {
        let query = { userId: req.session.user._id }; 

        if (patientName) {
            query.patientName = { $regex: patientName, $options: 'i' }; 
        }

        if (mrNumber) {
            query.mrNumber = mrNumber; 
        }

        const logbooks = await LogbookCollection.find(query);

        res.json(logbooks);
    } catch (error) {
        console.error('Error searching logbooks:', error);
        res.status(500).json({ error: 'Failed to search logbooks' });
    }
});




app.get('/api/logbooks', async (req, res) => {
    try {
        const logbooks = await LogbookCollection.find({ userId: req.user._id });

        
        const formattedLogbooks = logbooks.map(logbook => {
            console.log('Received logbook:', logbook);  
            return {
                ...logbook._doc,
                date: logbook._doc.date ? new Date(logbook._doc.date).toISOString().split('T')[0] : 'Date not available', 
                mrNumber: logbook.mrNumber 
            };
        });
        

        res.status(200).json(formattedLogbooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching logbook entries' });
    }
});


const hbs = require('hbs');


hbs.registerHelper('formatDate', function(date) {
    console.log('Formatting date:', date); 
    if (!date) return '';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Invalid Date';
    const options = { day: 'numeric', month: 'long', year: 'numeric' }; 
    return parsedDate.toLocaleDateString('en-US', options);
});




const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port http:localhost:${port}`);
});

