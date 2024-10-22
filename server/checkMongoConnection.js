// Import Mongoose
const mongoose = require('mongoose');

// Define the MongoDB URI (Replace this with your actual MongoDB connection string)
const mongoURI = 'mongodb+srv://mohalifarhan:AXhBteYQw3M7om6M@clusterlog.vd93z.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLog'; // 

// Define a simple schema and model for testing
const testSchema = new mongoose.Schema({
    name: String
});

const Test = mongoose.model('Test', testSchema);

// Function to check MongoDB connection
async function checkMongoConnection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Mongoose is connected to the database.');

        // Insert a test document
        const newDoc = new Test({ name: 'Test User' });
        await newDoc.save();
        console.log('Document inserted:', newDoc);

        // Perform a test query to check the connection
        const doc = await Test.findOne({});
        
        if (doc) {
            console.log('Document found:', doc);
        } else {
            console.log('No documents found in the collection.');
        }
    } catch (err) {
        console.error('Mongoose connection error:', err);
    } finally {
        // Disconnect from MongoDB
        await mongoose.connection.close();
        console.log('Mongoose connection closed.');
    }
}

// Run the connection check
checkMongoConnection();
