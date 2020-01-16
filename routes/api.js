const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/books', (req, res, next) => {
  Book.find()
    .then(response => res.json(response))
    .catch(error => console.log(error))
});

router.get('/books/:bookId', (req, res, next) => {
  Book.findById(req.params.bookId)
    .then(response => res.json(response))
    .catch(error => console.log(error))
});

// geo query location using near
router.post('/books/near', (req, res, next) => {
  const {
    loc
  } = req.body.address;

  Book.find().where('location').near({
      center: {
        type: 'Point',
        coordinates: [loc[1], loc[0]]
      },
      maxDistance: 5000
    })
    .then(response => res.json(response))
    .catch(error => console.log(error))
});


module.exports = router;