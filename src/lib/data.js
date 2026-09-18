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

function getWarrantyPolicy() {
  return readJSON("warranty-policy.json");
}

function getRealProducts() {
  return readJSON("products.json");
}

function getDemoProducts() {
  return readJSON("demo-products.json");
}

function getProductGroupBySlug(slug, { includeDemo = false } = {}) {
  const pool = includeDemo
    ? [...getRealProducts(), ...getDemoProducts()]
    : getRealProducts();
  return pool.find((g) => g.slug === slug) || null;
}

function formatPriceVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getInStockVariants(group) {
  return group.variants.filter((v) => v.stockStatus === "in_stock");
}

function getPriceRange(group) {
  const variants = getInStockVariants(group).length > 0 ? getInStockVariants(group) : group.variants;
  const prices = variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getGroupStorages(group) {
  return [...new Set(group.variants.map((v) => v.storageGb))].sort((a, b) => a - b);
}

// Một nhóm model khớp bộ lọc nếu có ít nhất 1 máy (variant) thoả tất cả điều kiện được chọn.
function filterProducts(groups, { line, storage, condition, maxPrice } = {}) {
  return groups.filter((group) => {
    if (line && group.line !== line) return false;
    const hasMatch = group.variants.some((v) => {
      if (storage && String(v.storageGb) !== String(storage)) return false;
      if (condition && v.cosmeticCondition !== condition) return false;
      if (maxPrice && v.price > Number(maxPrice)) return false;
      return true;
    });
    return hasMatch;
  });
}

function getFilterOptions(groups) {
  const allVariants = groups.flatMap((g) => g.variants);
  const storages = [...new Set(allVariants.map((v) => v.storageGb))].sort((a, b) => a - b);
  const conditions = [...new Set(allVariants.map((v) => v.cosmeticCondition))];
  return { storages, conditions };
}

module.exports = {
  getSiteConfig,
  getComparison,
  getCategories,
  getWarrantyPolicy,
  getRealProducts,
  getDemoProducts,
  getProductGroupBySlug,
  formatPriceVND,
  filterProducts,
  getFilterOptions,
  getInStockVariants,
  getPriceRange,
  getGroupStorages,
};
