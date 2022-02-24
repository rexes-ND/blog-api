const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const blogRouter = require("./routes/blogRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/api/blogs", blogRouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(
  //   `Can't find ${req.originalUrl} on this server!`
  // );
  // err.status = "fail";
  // err.statusCode = 404;

  next(
    new AppError(
      "Can't find ${req.originalUrl} on this server!",
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
