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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
