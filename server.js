const path = require("path");
const express = require("express");
const { getSiteConfig, getComparison } = require("./src/lib/data");

const indexRouter = require("./src/routes/index");
const productsRouter = require("./src/routes/products");
const pagesRouter = require("./src/routes/pages");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "src", "public")));

app.use((req, res, next) => {
  res.locals.siteConfig = getSiteConfig();
  res.locals.comparison = getComparison();
  res.locals.currentPath = req.path;
  res.locals.isDev = app.get("env") !== "production";
  next();
});

app.use("/", indexRouter);
app.use("/san-pham", productsRouter);
app.use("/", pagesRouter);

app.use((req, res) => {
  res.status(404).render("404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Xóm Táo store đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
