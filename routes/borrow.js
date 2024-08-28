// routes/borrow.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');

// Borrow a book
router.post('/borrow/:bookId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book || book.copies === 0) {
      return res.status(400).json({ msg: 'Book not available' });
    }

    const borrowing = new Borrowing({ user: req.user.id, book: req.params.bookId });
    await borrowing.save();

    book.copies -= 1;
    await book.save();

    res.json(borrowing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Return a book
router.post('/return/:bookId', auth, async (req, res) => {
  try {
    const borrowing = await Borrowing.findOne({
      user: req.user.id,
      book: req.params.bookId,
      returnedAt: null,
    });

    if (!borrowing) {
      return res.status(400).json({ msg: 'No record of borrowing this book' });
    }

    borrowing.returnedAt = Date.now();
    await borrowing.save();

    const book = await Book.findById(req.params.bookId);
    book.copies += 1;
    await book.save();

    res.json({ msg: 'Book returned' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Borrow history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Borrowing.find({ user: req.user.id })
      .populate('book', 'title author')
      .exec();

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
