const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('node:fs'); //Import the fs module
const linebyline = require('linebyline');      // linebyline for reading files


const app = express();
const PORT = 3000;

const exphbsInstance = exphbs.create({
    extname: '.hbs',
    helpers: {
        removeExtension: function (filename) {
            return filename.replace('.jpg', '');  // Removes '.jpg'
        },
        eq: function (a, b) {
            return a === b;  // Helper for equality check
        }
    }
});

app.engine('hbs', exphbsInstance.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const images = [];
const readStream = fs.createReadStream(path.join(__dirname, 'imagelist.txt')); // Create readable stream
const rl = linebyline(readStream);

rl.on('line', (line, lineCount, byteCount) => {
    const trimmedLine = line.trim();
    if (trimmedLine !== '') { 
        images.push(trimmedLine);
    }
});

rl.on('close', () => {
    // Routes
    app.get('/', (req, res) => {
        const defaultImage = images.length > 0 ? images[0] : 'default.jpg';
        res.render('index', { userName: 'Dil Humyra Sultana Borna', images, selectedImage: defaultImage });
    });

    app.get('/image', (req, res) => {
        const selectedImage = req.query.image || (images.length > 0 ? images[0] : 'default.jpg');
        res.render('index', { userName: 'Dil Humyra Sultana Borna', images, selectedImage });
    });

    // Start Server
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});

rl.on('error', (err) => {
    console.error("Error reading imagelist.txt:", err);
    const defaultImage = 'default.jpg';
    res.render('index', { userName: 'Dil Humyra Sultana Borna', images: [], selectedImage: defaultImage });
});
