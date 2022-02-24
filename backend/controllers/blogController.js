const Blog = require("../models/blogModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

module.exports.getAllBlogs = catchAsync(
  async (req, res, next) => {
    const features = new APIFeatures(
      Blog.find(),
      req.query
    );
    const blogs = await features.query;
    res.status(200).json({
      status: "success",
      data: {
        blogs,
      },
    });
  }
);

module.exports.getBlog = catchAsync(
  async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(
        new AppError("No blog found with that ID", 404)
      );
    }
    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  }
);

module.exports.createBlog = catchAsync(
  async (req, res, next) => {
    const newBlog = await Blog.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog,
      },
    });
  }
);

module.exports.updateBlog = catchAsync(
  async (req, res, next) => {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidator: true,
      }
    );

    if (!blog) {
      return next(
        new AppError("No blog found with that ID", 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  }
);

module.exports.deleteBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) {
    return next(
      new AppError("No blog found with that ID", 404)
    );
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
