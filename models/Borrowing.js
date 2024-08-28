// models/Borrowing.js
const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date },
});

module.exports = mongoose.model('Borrowing', borrowingSchema);
