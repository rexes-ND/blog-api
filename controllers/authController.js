const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports.signup = async (req, res, next) => {
  try {
    if (req.body.password != req.body.passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Please your password again!",
      });
    }
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordChangedAt: Date.now(),
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
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

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email or Password is missing",
      });
    }

    const user = await User.findOne({ email }).select(
      "+password" // Necessary since password is not selected by default
    );
    if (
      !user ||
      !(await user.correctPassword(password, user.password))
    ) {
      return res.status(404).json({
        status: "fail",
        message: "Failed to login",
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.protect = async (req, res, next) => {
  try {
    let token;
    // console.log(req.headers);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "User must login first",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    // console.log(decoded);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message:
          "The user belonging to this token does not exist",
      });
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "The user changed the password",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message:
          "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "There is no user with given email",
      });
    }
    const resetToken = user.createPasswordResetToken();
    // await user.save();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetPassword/${resetToken}`;

    const message = `Submit a PATCH request with your new password and password confirm to following URL: ${resetURL}.\n`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      console.log(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        status: "fail",
        message:
          "There was an error sending the email. Try again later!",
      });
    }
  } catch (err) {
    console.log(err.message);
    res.json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Token is invalid or expired",
      });
    }

    // user.password = req.body.password;
    // user.passwordConfirm = req.body.passwordConfirm;
    if (req.body.password != user.passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords doesn't match",
      });
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};
