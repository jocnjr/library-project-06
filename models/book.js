// models/book.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: String,
  author: [{
    type: Schema.Types.ObjectId,
    ref: 'Author'
  }],
  description: String,
  rating: Number,
  reviews: [{
    user: String,
    comments: String
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: {
      type: String
    },
    coordinates: [Number]
  }
}, {
  timestamps: true
});

bookSchema.index({
  location: '2dsphere'
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;