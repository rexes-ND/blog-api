const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    require: [true, "A blog must have a title"],
    minlength: [
      10,
      "A blog title must have at least 10 characters",
    ],
    maxlength: [
      50,
      "A blog title must have at most 50 characters",
    ],
  },
  text: {
    type: String,
    require: [true, "A blog must have a text"],
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
