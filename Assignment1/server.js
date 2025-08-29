const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");

// Check if the 'public' folder exists, if not, create it
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });  // Create the folder (and any missing parent directories)
    console.log("'public' folder created.");
}

// Check if the 'views' folder exists, if not, create it
const viewsDir = path.join(__dirname, 'views');
if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir, { recursive: true });  // Create the folder (and any missing parent directories)
    console.log("'views' folder created.");
}

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static("public"));

// Set up Handlebars as the view engine
app.engine("hbs", exphbs.engine({ extname: "hbs" }));
app.set("view engine", "hbs");

// Default image (before selection)
let currentImage = "restaurant.png";
let currentImageName = "Gallery";

// Route to display home page
app.get("/", (req, res) => {
    res.render("home", { selectedImage: currentImage, selectedImageName: currentImageName });
});

// Handle form submission
app.post("/", (req, res) => {
    const selectedImage = req.body.rdoImage;

    // Define image mappings
    const imageMap = {
        "Banana": "banana.jpg",
        "Burger": "burger.jpg",
        "IcePops": "ice-pops.jpg",
        "IceTea": "ice-tea.jpg",
        "Juice": "juice.jpg",
        "Kiwi": "kiwi.jpg",
        "Orange": "orange.jpg",
        "Sandwich": "sandwich.jpg",
        "Strawberry": "strawberry.jpg",
        "HotDog": "hot-dog.jpg"
    };

    // Set the current image based on selection
    if (imageMap[selectedImage]) {
        currentImage = imageMap[selectedImage];
        currentImageName = selectedImage;
    } else {
        currentImage = "restaurant.png"; // Default image
        currentImageName = "Gallery";
    }

    res.render("home", { selectedImage: currentImage, selectedImageName: currentImageName });
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
