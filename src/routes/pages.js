const express = require("express");
const router = express.Router();
const {
  getDemoProducts,
  getCategories,
  formatPriceVND,
  getFilterOptions,
} = require("../lib/data");

router.get("/gioi-thieu", (req, res) => {
  res.render("about", { pageTitle: "Về chúng tôi" });
});

router.get("/lien-he", (req, res) => {
  res.render("contact", { pageTitle: "Liên hệ" });
});

// Chỉ dùng để xem trước giao diện với dữ liệu minh hoạ — không hoạt động ở production.
router.get("/preview-demo", (req, res, next) => {
  if (process.env.NODE_ENV === "production") return next();

  const products = getDemoProducts();
  const categories = getCategories();
  const filterOptions = getFilterOptions(products);

  res.render("catalog", {
    pageTitle: "Xem trước giao diện (Demo)",
    products,
    categories,
    filterOptions,
    filters: {},
    formatPriceVND,
    isDemoView: true,
  });
});

module.exports = router;
