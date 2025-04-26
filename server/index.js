const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const Note = require('./models/Note');
const User = require('./models/User');
const auth = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://notes-mern-final.vercel.app'
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// MongoDB Connection with error handling
const MONGODB_URI = process.env.MONGODB_URI;

// Debug log to check environment variables
console.log('Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: MONGODB_URI ? 'MongoDB URI is set' : 'MongoDB URI is not set'
});

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    console.error('Please make sure you have a .env file in the server directory with MONGODB_URI defined');
    process.exit(1);
}

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Authentication Routes
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = new User({ email, password });
        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Protected API Routes
app.get('/api/notes', auth, async (req, res) => {
    try {
        console.log('Fetching notes...');
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        console.log('Notes fetched successfully:', notes);
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
    }
});

app.post('/api/notes', auth, async (req, res) => {
    try {
        console.log('Creating note:', req.body);
        if (!req.body.text) {
            return res.status(400).json({ error: 'Note text is required' });
        }
        const note = new Note({ 
            text: req.body.text,
            user: req.user._id
        });
        await note.save();
        console.log('Note created successfully:', note);
        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note', details: error.message });
    }
});

app.put('/api/notes/:id', auth, async (req, res) => {
    try {
        console.log('Updating note:', req.params.id, req.body);
        if (!req.body.text) {
            return res.status(400).json({ error: 'Note text is required' });
        }
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { text: req.body.text },
            { new: true, runValidators: true }
        );
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        console.log('Note updated successfully:', note);
        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note', details: error.message });
    }
});

app.delete('/api/notes/:id', auth, async (req, res) => {
    try {
        console.log('Attempting to delete note:', req.params.id);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.error('Invalid note ID format:', req.params.id);
            return res.status(400).json({ error: 'Invalid note ID format' });
        }

        const note = await Note.findOneAndDelete({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!note) {
            console.error('Note not found:', req.params.id);
            return res.status(404).json({ error: 'Note not found' });
        }

        console.log('Note deleted successfully:', note);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note', details: error.message });
    }
});

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve the React app for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});