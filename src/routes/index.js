const express = require("express");
const router = express.Router();
const {
  getRealProducts,
  getCategories,
  getComparison,
  formatPriceVND,
} = require("../lib/data");

router.get("/", (req, res) => {
  const products = getRealProducts();
  const featured = products.slice(0, 8);
  const categories = getCategories();
  const comparison = getComparison();

  res.render("home", {
    pageTitle: "Trang chủ",
    featured,
    categories,
    comparison,
    formatPriceVND,
  });
});

module.exports = router;
