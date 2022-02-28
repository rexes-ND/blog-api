const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports.signup = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  }
);

module.exports.login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError("Email or Password is missing"),
        400
      );
    }

    const user = await User.findOne({ email }).select(
      "+password"
    );
    if (
      !user ||
      !(await user.correctPassword(password, user.password))
    ) {
      return next(
        new AppError(
          "Email or Password is not correct",
          401
        )
      );
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  }
);

module.exports.protect = catchAsync(
  async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("User must login first", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does not exist."
        ),
        401
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("The user changed the password!", 401)
      );
    }

    req.user = currentUser;
    next();
  }
);

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
    }

    next();
  };
};

module.exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return next(
        new AppError(
          "There is no user with given email.",
          404
        )
      );
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetPassword/${resetToken}`;

    const message = `Submit a PATCH request with your new password and passwordConfirm to following URL: ${resetURL}.\n`;
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

      next(
        new AppError(
          "There was an error sending the email. Try again later!"
        ),
        500
      );
    }
  }
);

module.exports.resetPassword = catchAsync(
  async (req, res, next) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new AppError("Token is invalid or expired", 404)
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  }
);
