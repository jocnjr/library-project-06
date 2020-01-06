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
  rating: Number
}, {
  timestamps: true
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;