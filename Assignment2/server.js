const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations
const linebyline = require('linebyline');
const clientSessions = require('client-sessions');

const app = express();
const PORT = 3000; // Define the port to listen on

// Set up Handlebars
const exphbsInstance = exphbs.create({
    extname: '.hbs',
    defaultLayout: false,
    helpers: {
        removeExtension: function (filename) {
            return filename.replace('.jpg', '');
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
    secret: "random_secret_key", // Consider using a stronger, randomly generated secret in production
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));
app.use(express.static(path.join(__dirname, 'public')));

// Load user data with error handling
async function loadUserData() {
    try {
        const data = await fs.readFile(path.join(__dirname, "user.json"), "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading user data:", error);
        return {}; // Return an empty object if error occurs
    }
}

async function loadImages() {
    return new Promise((resolve, reject) => {
        const images = [];
        const rl = linebyline(path.join(__dirname, 'imagelist.txt'));
        rl.on('line', (line) => {
            const trimmedLine = line.trim();
            if (trimmedLine !== 'Gallery.jpg') {
                images.push(trimmedLine);
            }
        });
        rl.on('end', () => resolve(images));
        rl.on('error', reject);
    });
}

// Initialize users and images arrays on server start
let users = {};
let images = []; // Declare images array here

(async () => {
    try {
        users = await loadUserData();
        images = await loadImages();
        console.log("Users and images loaded successfully");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
})();

// Show Login Page
app.get('/', (req, res) => {
    res.render('login', { name: "Dil Humyra Sultana Borna" });
});

// Handle Login Request (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!users[username]) {
        return res.render("login", { name: "Dil Humyra Sultana Borna", error: "Not a registered username" });
    }
    if (users[username] !== password) {
        return res.render("login", { name: "Dil Humyra Sultana Borna", error: "Invalid password" });
    }

    // Store user session with the correct email in the user session
    req.session.user = { email: username }; // Store the email directly
    res.redirect('/gallery');
});

// Show Gallery Page
app.get('/gallery', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    res.render('index', {
        userName: req.session.user.email, // Use email from session
        images,
        selectedImage: 'Gallery.jpg'
    });
});

// Handle Image Selection (POST)
app.post('/image', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const selectedImage = req.body.image || 'Gallery.jpg'; 
    res.render('index', {
        userName: req.session.user.email, // Use email from session
        images,
        selectedImage
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
