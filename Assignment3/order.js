// routes/order.js
const express = require('express');
const router = express.Router();
const Gallery = require('../models/galleryModel');
const randomstring = require('randomstring');

// Order Page Route
router.get('/order/:filename', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const image = await Gallery.findOne({ FILENAME: req.params.filename }).lean();

        if (!image) {
            return res.status(404).send("Image not found");
        }

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
router.post('/buy', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const filename = req.body.filename;
    const purchaseId = require('randomstring').generate(10); // Generate random string

    try {
        await Gallery.updateOne({ FILENAME: filename }, { STATUS: 'S' });

        console.log(`Image "${filename}" was purchased. Purchase ID: ${purchaseId}`); // Log it

        res.redirect('/gallery');
    } catch (err) {
        console.error("Error updating image status:", err);
        res.status(500).send("Purchase failed.");
    }
});

module.exports = router;