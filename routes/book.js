const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');


// GET book form create
router.get('/add-book', (req, res) => {
  res.render('add-book');
});

// POST book create
router.post('/add-book', (req, res, next) => {
  Book.create(req.body)
    .then(_ => res.redirect('/books'))
    .catch(error => next(error))
});

// GET book edit form
router.get('/edit-book/:bookId', (req, res) => {
  let {
    bookId
  } = req.params;

  Book.findById(bookId)
    .then(book => {
      res.render('edit-book', book);
    })
    .catch(error => next(error))
});

// POST book edit
router.post('/edit-book', (req, res, next) => {
  const {
    _id,
    ...book
  } = req.body;

  Book.findByIdAndUpdate(_id, book)
    .then(_ => res.redirect('/books'))
    .catch(error => next(error))
});

// GET books home page
router.get('/', (req, res, next) => {
  Book.find()
    .then(books => {
      res.render('index-books', {
        books
      });
    })
    .catch(error => console.log(error))
});

// GET DELETE book
router.get('/delete-book', (req, res, next) => {
  Book.findByIdAndDelete(req.query.bookId)
    .then(_ => res.redirect('/books'))
    .catch(error => next(error))
});

// GET books details page
router.get('/:bookId', (req, res, next) => {

  let {
    bookId
  } = req.params;

  Book.findById(bookId)
    .populate('author')
    .then(book => {
      console.log(book);
      res.render('details-books', {
        book
      });
    })
    .catch(error => next(error))
});


module.exports = router;