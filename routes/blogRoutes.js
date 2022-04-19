const express = require("express");
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  // .get(authController.protect, blogController.getAllBlogs)
  .get(blogController.getAllBlogs)
  .post(blogController.createBlog);

router
  .route("/:id")
  .get(blogController.getBlog)
  .patch(blogController.updateBlog)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    blogController.deleteBlog
  );

module.exports = router;
