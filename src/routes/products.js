const express = require("express");
const router = express.Router();
const {
  getRealProducts,
  getCategories,
  getProductBySlug,
  filterProducts,
  formatPriceVND,
  getFilterOptions,
} = require("../lib/data");

router.get("/", (req, res) => {
  const { line, storage, condition, maxPrice } = req.query;
  const all = getRealProducts();
  const filtered = filterProducts(all, { line, storage, condition, maxPrice });
  const categories = getCategories();
  const filterOptions = getFilterOptions(all);

  res.render("catalog", {
    pageTitle: "Sản phẩm",
    products: filtered,
    categories,
    filterOptions,
    filters: { line, storage, condition, maxPrice },
    formatPriceVND,
    isDemoView: false,
  });
});

router.get("/:slug", (req, res, next) => {
  const includeDemo = process.env.NODE_ENV !== "production";
  const product = getProductBySlug(req.params.slug, { includeDemo });
  if (!product) return next();

  res.render("product-detail", {
    pageTitle: product.model,
    product,
    formatPriceVND,
  });
});

module.exports = router;
