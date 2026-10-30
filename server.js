const path = require("path");
const express = require("express");
const { getSiteConfig, getComparison, getRealProducts } = require("./src/lib/data");
const { buildSitemap } = require("./src/lib/seo");
const { getPosts } = require("./src/lib/posts");

const indexRouter = require("./src/routes/index");
const productsRouter = require("./src/routes/products");
const pagesRouter = require("./src/routes/pages");
const blogRouter = require("./src/routes/blog");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Gom www về tên miền chính để Google không tính thành 2 website trùng nội dung.
app.use((req, res, next) => {
  const host = req.get("host") || "";
  if (host.startsWith("www.")) {
    return res.redirect(301, getSiteConfig().siteUrl + req.originalUrl);
  }
  next();
});

app.use(express.static(path.join(__dirname, "src", "public")));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: ${getSiteConfig().siteUrl}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").send(buildSitemap(getSiteConfig(), getRealProducts(), getPosts()));
});

app.use((req, res, next) => {
  res.locals.siteConfig = getSiteConfig();
  res.locals.comparison = getComparison();
  res.locals.currentPath = req.path;
  res.locals.isDev = app.get("env") !== "production";
  next();
});

app.use("/", indexRouter);
app.use("/san-pham", productsRouter);
app.use("/blog", blogRouter);
app.use("/", pagesRouter);

app.use((req, res) => {
  res.status(404).render("404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Xóm Táo store đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
