const Blog = require("../models/blogModel");

module.exports.getAllBlogs = async (req, res) => {
  try {
    let blogs;
    const user = req.user;
    if (user.role === "admin") {
      blogs = await Blog.find();
    } else {
      // user
      blogs = await Blog.find({
        $or: [{ user: user._id }, { visibility: "public" }],
      });
    }
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
    const user = req.user;
    let blog;

    blog = findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with given ID",
      });
    }
    if (
      user.role !== "admin" &&
      blog.visibility !== "public" &&
      blog.user !== user._id
    ) {
      return res.status(404).json({
        status: "fail",
        message: "User does not have access permission",
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
    let user = req.user;
    req.body.user = user._id;
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
    const user = req.user;
    // const blog = await Blog.findByIdAndUpdate(
    //   req.params.id,
    //   req.body,
    //   {
    //     new: true,
    //     runValidators: true,
    //   }
    // );
    let blog;
    if (user.role === "admin") {
      blog = await Blog.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidator: true,
        }
      );
    } else {
      blog = Blog.findOneAndUpdate(
        {
          _id: req.params.id,
          user: user._id,
        },
        req.body,
        {
          new: true,
          runValidator: true,
        }
      );
    }
    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message:
          "No blog found with that ID or you are not allowed to access the blog",
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
    let blog;
    const user = req.user;
    if (user.role === "admin") {
      blog = await Blog.findByIdAndDelete(req.params.id);
    } else {
      blog = await Blog.findOneAndDelete({
        _id: req.params.id,
        user: user._id,
      });
    }
    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message:
          "No blog found with that ID or you are not allowed to access the blog",
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
