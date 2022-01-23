const express = require("express");
const morgan = require("morgan");

const blogRouter = require("./routes/blogRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/api/blogs", blogRouter);

module.exports = app;
