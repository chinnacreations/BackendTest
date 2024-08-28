// graphql/resolvers.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');

const resolvers = {
  Query: {
    users: async () => await User.find(),
    books: async () => await Book.find(),
    borrowings: async () => await Borrowing.find().populate('user').populate('book'),
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      let user = await User.findOne({ email });
      if (user) throw new Error('User already exists');

      user = new User({ name, email, password });
      await user.save();

      const payload = { user: { id: user.id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      return token;
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');

      const payload = { user: { id: user.id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      return token;
    },
    addBook: async (_, { title, author, ISBN, publicationDate, genre, copies }, context) => {
      if (context.user.role !== 'Admin') throw new Error('Admin access only');

      const newBook = new Book({ title, author, ISBN, publicationDate, genre, copies });
      await newBook.save();
      return newBook;
    },
    borrowBook: async (_, { bookId }, context) => {
      const book = await Book.findById(bookId);
      if (!book || book.copies === 0) throw new Error('Book not available');

      const borrowing = new Borrowing({ user: context.user.id, book: bookId });
      await borrowing.save();

      book.copies -= 1;
      await book.save();

      return borrowing;
    },
    returnBook: async (_, { bookId }, context) => {
      const borrowing = await Borrowing.findOne({
        user: context.user.id,
        book: bookId,
        returnedAt: null,
      });

      if (!borrowing) throw new Error('No record of borrowing this book');

      borrowing.returnedAt = Date.now();
      await borrowing.save();

      const book = await Book.findById(bookId);
      book.copies += 1;
      await book.save();

      return 'Book returned';
    },
  },
};

module.exports = resolvers;
