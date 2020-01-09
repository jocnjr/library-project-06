const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const ensureLogin = require("connect-ensure-login");


// GET book form create
router.get('/add-book', ensureLogin.ensureLoggedIn(), (req, res) => {
  Author.find()
    .sort({
      name: 1
    })
    .then(authors => res.render('add-book', {
      authors
    }))
    .catch(error => console.log(error))
});

// POST book create
router.post('/add-book', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  console.log(req.body)
  const {
    title,
    description,
    rating,
    author,
    latitude,
    longitude
  } = req.body;

  let location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };

  Book.create({
      owner: req.user._id,
      title,
      description,
      rating,
      author,
      location
    })
    .then(_ => res.redirect('/books'))
    .catch(error => next(error))
});

// GET book edit form
// router.get('/edit-book/:bookId', (req, res) => {
//   let {
//     bookId
//   } = req.params;

//   Book.findById(bookId)
//     .then(book => {
//       res.render('edit-book', book);
//     })
//     .catch(error => next(error))
// });

// POST book edit
router.post('/edit-book', (req, res, next) => {
  const {
    _id,
    title,
    description,
    rating,
    author,
    latitude,
    longitude
  } = req.body;

  let location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };

  Book.findByIdAndUpdate(_id, {
      title,
      description,
      rating,
      author,
      location
    })
    .then(_ => res.redirect('/books'))
    .catch(error => next(error))
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

// REVIEWS

// create review post

router.post('/reviews/add', (req, res, next) => {
  const {
    user,
    comments
  } = req.body;
  Book.update({
      _id: req.query.book_id
    }, {
      $push: {
        reviews: {
          user,
          comments
        }
      }
    })
    .then(book => {
      res.redirect('/books/' + req.query.book_id)
    })
    .catch((error) => {
      console.log(error)
    })
});

// protected routes below vvvv

// router.use((req, res, next) => {
//   if (req.session.currentUser) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// });

// GET books home page - ensure login protect the /books route
router.get('/', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  console.log(req.user);
  Book.find({
      owner: req.user._id
    })
    .then(books => {
      res.render('index-books', {
        books
      });
    })
    .catch(error => console.log(error))
});

const checkGuest = checkRoles('GUEST');
const checkEditor = checkRoles('EDITOR');
const checkAdmin = checkRoles('ADMIN');

// GET book edit form
router.get('/edit-book/:bookId', (req, res) => {
  console.log(req.user)
  let {
    bookId
  } = req.params;

  Book.findById(bookId)
    .then(book => {
      res.render('edit-book', book);
    })
    .catch(error => next(error))
});

function checkRoles(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}

module.exports = router;