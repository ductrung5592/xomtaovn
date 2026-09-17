const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");

function readJSON(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function getSiteConfig() {
  return readJSON("site-config.json");
}

function getComparison() {
  return readJSON("comparison.json");
}

function getCategories() {
  return readJSON("categories.json");
}

function getRealProducts() {
  return readJSON("products.json");
}

function getDemoProducts() {
  return readJSON("demo-products.json");
}

function getProductBySlug(slug, { includeDemo = false } = {}) {
  const pool = includeDemo
    ? [...getRealProducts(), ...getDemoProducts()]
    : getRealProducts();
  return pool.find((p) => p.slug === slug) || null;
}

function formatPriceVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function filterProducts(products, { line, storage, condition, maxPrice } = {}) {
  return products.filter((p) => {
    if (line && p.line !== line) return false;
    if (storage && String(p.storageGb) !== String(storage)) return false;
    if (condition && p.cosmeticCondition !== condition) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    return true;
  });
}

function getFilterOptions(products) {
  const storages = [...new Set(products.map((p) => p.storageGb))].sort((a, b) => a - b);
  const conditions = [...new Set(products.map((p) => p.cosmeticCondition))];
  return { storages, conditions };
}

module.exports = {
  getSiteConfig,
  getComparison,
  getCategories,
  getRealProducts,
  getDemoProducts,
  getProductBySlug,
  formatPriceVND,
  filterProducts,
  getFilterOptions,
};
