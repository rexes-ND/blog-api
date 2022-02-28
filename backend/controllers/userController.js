const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

module.exports.getAllUsers = catchAsync(
  async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  }
);
