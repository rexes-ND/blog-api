const User = require("../models/userModel");

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      data: {
        users,
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

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with given ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
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

module.exports.createUser = async (req, res, next) => {
  try {
    const newUser = await User.create({ ...req.body });
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
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

module.exports.updateUser = async (req, res, next) => {
  try {
    // console.log(req.body);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with given ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err.message);
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
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
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
