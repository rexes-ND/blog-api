const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "A user must have a name"],
  },
  email: {
    type: String,
    require: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      "A user must have a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date, // For token validation
  passwordResetToken: String, // For password reset
  passwordResetExpires: Date, // For password reset
});

userSchema.pre("save", async function (next) {
  // isModified returns true if field is modified or document is created
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  if (!this._update.password) return next();

  this._update.password = await bcrypt.hash(
    this._update.password,
    12
  );
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew)
    return next();
  // password is modified and not new
  this.passwordChangedAt = Date.now();
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // This is sent to user

  this.passwordResetToken = crypto // This will be saved to DB and used for comparison
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expire date of reset token

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
