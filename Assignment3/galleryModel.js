// models/galleryModel.js

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  FILENAME: String,
  DESCRIPTION: String,
  PRICE: Number,
  STATUS: String // "A" for Available, "S" for Sold
});

module.exports = mongoose.model('Gallery', gallerySchema);