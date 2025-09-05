const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs').promises;
const clientSessions = require('client-sessions');

// Mongoose & Gallery Model
const mongoose = require('mongoose');
const Gallery = require('./models/galleryModel');

// Import order routes
const orderRoutes = require('./routes/order');

const app = express();
const PORT = 3000;

// MongoDB Atlas Connection
const mongoURL = "mongodb+srv://dhsborna:Hsb091797@cluster0.3pqh9ef.mongodb.net/WEB322?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

// Set up Handlebars
const exphbsInstance = exphbs.create({
    extname: '.hbs',
    defaultLayout: false,
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        removeExtension: function (filename) {
            return (filename && typeof filename === "string") ? filename.replace('.jpg', '') : '';
        },
        eq: function (a, b) {
            return a === b;
        }
    }
});

app.engine('hbs', exphbsInstance.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(clientSessions({
    cookieName: "session",
    secret: "random_secret_key",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));
app.use(express.static(path.join(__dirname, 'public')));

// Load user data
async function loadUserData() {
    try {
        const data = await fs.readFile(path.join(__dirname, "user.json"), "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading user data:", error);
        return {};
    }
}

// Initialize users
let users = {};
(async () => {
    try {
        users = await loadUserData();
        console.log("Users loaded successfully");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
})();

// Login Page
app.get('/', (req, res) => {
    res.render('login', { name: "Dil Humyra Sultana Borna" });
});

// Login Handler
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!users[username]) {
        return res.render("login", { name: "Dil Humyra Sultana Borna", error: "Not a registered username" });
    }
    if (users[username] !== password) {
        return res.render("login", { name: "Dil Humyra Sultana Borna", error: "Invalid password" });
    }

    req.session.user = { email: username };

    // Reset all image statuses on login
    try {
        await Gallery.updateMany({}, { STATUS: "A" });
        console.log("All images reset to 'A' on login.");
    } catch (err) {
        console.error("Error resetting image statuses:", err);
    }

    res.redirect('/gallery');
});

// Gallery Page
app.get('/gallery', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const selectedImage = req.query.image || 'Gallery.jpg';

    try {
        const availableImages = await Gallery.find({ STATUS: "A", FILENAME: { $exists: true } }).lean();
        const isValidImage = availableImages.some(img => img.FILENAME === selectedImage);

        res.render('index', {
            userName: req.session.user.email,
            images: availableImages,
            selectedImage: isValidImage ? selectedImage : 'Gallery.jpg'
        });
    } catch (error) {
        console.error("Error loading gallery:", error);
        res.render('index', {
            userName: req.session.user.email,
            images: [],
            selectedImage: 'Gallery.jpg',
            error: "Failed to load images from database."
        });
    }
});

// Image Selection POST
app.post('/image', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const selectedImage = req.body.image || 'Gallery.jpg';
    res.redirect(`/gallery?image=${encodeURIComponent(selectedImage)}`);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

// Order Page
app.get('/order/:filename', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const image = await Gallery.findOne({ FILENAME: req.params.filename }).lean();
        if (!image) return res.status(404).send("Image not found");

        res.render('order', {
            userName: req.session.user.email,
            image
        });
    } catch (error) {
        console.error("Error loading order page:", error);
        res.status(500).send("Something went wrong");
    }
});

// Buy Route
app.post('/buy', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const filename = req.body.filename;

    try {
        await Gallery.updateOne({ FILENAME: filename }, { STATUS: 'S' });
        res.redirect('/gallery');
    } catch (err) {
        console.error("Error updating image status:", err);
        res.status(500).send("Purchase failed.");
    }
});

// Use the separated order router
app.use('/', orderRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
