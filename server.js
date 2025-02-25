const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    const gmtTime = new Date().toISOString();
    res.send("Dil Humyra Sultana Borna - WEB322 " + gmtTime);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});