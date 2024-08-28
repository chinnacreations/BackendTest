// routes/books.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');

// Add new book (Admin only)
router.post('/', auth, async (req, res) => {
  const { title, author, ISBN, publicationDate, genre, copies } = req.body;

  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Admin access only' });
    }

    const newBook = new Book({ title, author, ISBN, publicationDate, genre, copies });
    await newBook.save();
    res.json(newBook);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update book (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Admin access only' });
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ msg: 'Book not found' });

    res.json(updatedBook);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete book (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Admin access only' });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ msg: 'Book not found' });

    res.json({ msg: 'Book deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// List books with pagination and filtering
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 10, genre, author } = req.query;

  const query = {};
  if (genre) query.genre = genre;
  if (author) query.author = author;

  try {
    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
