const express = require('express');
const router = express.Router();
const Book = require('../models/book');

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

// GET books details page

router.get('/:bookId', (req, res, next) => {

  let {
    bookId
  } = req.params;

  Book.findById(bookId)
    .then(book => {
      res.render('details-books', {
        book
      });
    })
    .catch(error => next(error))
});
module.exports = router;