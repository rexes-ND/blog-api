const Blog = require("../models/blogModel");

module.exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
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
      return res.status(404).json({
        status: "fail",
        message: "No blog found with given ID",
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
    if (err.name == "ValidationError") {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }
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
        runValidators: true,
      }
    );

    if (!blog) {
      return res.status(404).json({
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
    if (err.name == "ValidationError") {
      const errors = Object.values(err.errors).map(
        (el) => el.message
      );
      const message = `Invalid input data. ${errors.join(
        ". "
      )}`;
      return res.status(400).json({
        status: "fail",
        message: message,
      });
    }
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
      return res.status(404).json({
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
