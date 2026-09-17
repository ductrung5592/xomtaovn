const fs = require("fs");
const path = require("path");

const PRODUCTS_PATH = path.join(__dirname, "..", "data", "products.json");
const REQUIRED_FIELDS = [
  "id",
  "slug",
  "model",
  "line",
  "storageGb",
  "color",
  "batteryHealth",
  "cosmeticCondition",
  "price",
  "stockStatus",
  "images",
];
const VALID_STOCK_STATUS = ["in_stock", "sold"];

function fail(message) {
  console.error("✗ " + message);
  process.exitCode = 1;
}

function main() {
  let products;
  try {
    products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));
  } catch (err) {
    fail("Không đọc được data/products.json: " + err.message);
    return;
  }

  if (!Array.isArray(products)) {
    fail("data/products.json phải là một mảng (array).");
    return;
  }

  const seenIds = new Set();
  const seenSlugs = new Set();
  let errorCount = 0;

  products.forEach((product, index) => {
    const label = `Sản phẩm #${index + 1} (${product.slug || product.id || "?"})`;

    REQUIRED_FIELDS.forEach((field) => {
      if (product[field] === undefined || product[field] === null || product[field] === "") {
        fail(`${label}: thiếu trường bắt buộc "${field}"`);
        errorCount++;
      }
    });

    if (typeof product.storageGb !== "undefined" && (typeof product.storageGb !== "number" || product.storageGb <= 0)) {
      fail(`${label}: storageGb phải là số dương`);
      errorCount++;
    }

    if (
      typeof product.batteryHealth !== "undefined" &&
      (typeof product.batteryHealth !== "number" || product.batteryHealth < 0 || product.batteryHealth > 100)
    ) {
      fail(`${label}: batteryHealth phải là số từ 0 đến 100`);
      errorCount++;
    }

    if (typeof product.price !== "undefined" && (typeof product.price !== "number" || product.price <= 0)) {
      fail(`${label}: price phải là số dương`);
      errorCount++;
    }

    if (product.stockStatus && !VALID_STOCK_STATUS.includes(product.stockStatus)) {
      fail(`${label}: stockStatus không hợp lệ (chỉ chấp nhận: ${VALID_STOCK_STATUS.join(", ")})`);
      errorCount++;
    }

    if (Array.isArray(product.images) && product.images.length === 0) {
      fail(`${label}: cần ít nhất 1 ảnh trong "images"`);
      errorCount++;
    }

    if (product.id) {
      if (seenIds.has(product.id)) {
        fail(`${label}: id bị trùng`);
        errorCount++;
      }
      seenIds.add(product.id);
    }

    if (product.slug) {
      if (seenSlugs.has(product.slug)) {
        fail(`${label}: slug bị trùng`);
        errorCount++;
      }
      seenSlugs.add(product.slug);
    }
  });

  if (errorCount === 0) {
    console.log(`✓ data/products.json hợp lệ (${products.length} sản phẩm).`);
  } else {
    console.error(`\n${errorCount} lỗi được tìm thấy trong data/products.json.`);
  }
}

main();
