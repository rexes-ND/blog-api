const Blog = require("../models/blogModel");

module.exports.getAllBlogs = async (req, res) => {
  const blogs = await Blog.find();
  try {
    res.status(200).json({
      status: "success",
      data: {
        blogs,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({
        status: "fail",
        message: "No blog found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.createBlog = async (req, res, next) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidator: true,
      }
    );

    if (!blog) {
      res.status(404).json({
        status: "fail",
        message: "No blog found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(
      req.params.id
    );

    if (!blog) {
      res.status(404).json({
        status: "fail",
        message: "No blog found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};
