const express = require("express");
const router = express.Router();
const {
  getRealProducts,
  getCategories,
  getComparison,
  formatPriceVND,
  formatStorage,
  getPriceRange,
  getSiteConfig,
} = require("../lib/data");
const { localBusinessSchema } = require("../lib/seo");

router.get("/", (req, res) => {
  const products = getRealProducts();
  const featured = products.slice(0, 8);
  const categories = getCategories();
  const comparison = getComparison();

  res.render("home", {
    pageTitle: "iPhone cũ zin 100% tại Hà Đông",
    metaDescription:
      "Xóm Táo bán iPhone cũ zin 100% tại 60 Trần Phú, Hà Đông. Giá rõ từng máy, kiểm tra thoải mái cùng thợ độc lập. Máy không zin: tặng máy, đền 10 triệu.",
    jsonLd: [localBusinessSchema(getSiteConfig())],
    featured,
    categories,
    comparison,
    formatPriceVND,
    formatStorage,
    getPriceRange,
  });
});

module.exports = router;
