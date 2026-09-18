const fs = require("fs");
const path = require("path");

const PRODUCTS_PATH = path.join(__dirname, "..", "data", "products.json");
const PUBLIC_DIR = path.join(__dirname, "..", "src", "public");

const GROUP_REQUIRED_FIELDS = ["model", "line", "slug", "image", "variants"];
const VARIANT_REQUIRED_FIELDS = [
  "id",
  "storageGb",
  "color",
  "batteryHealth",
  "cosmeticCondition",
  "price",
  "stockStatus",
];
const VALID_STOCK_STATUS = ["in_stock", "sold"];

function fail(message) {
  console.error("✗ " + message);
  process.exitCode = 1;
}

function main() {
  let groups;
  try {
    groups = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));
  } catch (err) {
    fail("Không đọc được data/products.json: " + err.message);
    return;
  }

  if (!Array.isArray(groups)) {
    fail("data/products.json phải là một mảng các nhóm model (array).");
    return;
  }

  const seenIds = new Set();
  const seenSlugs = new Set();
  let errorCount = 0;
  let variantCount = 0;

  groups.forEach((group, index) => {
    const label = `Nhóm #${index + 1} (${group.slug || group.model || "?"})`;

    GROUP_REQUIRED_FIELDS.forEach((field) => {
      if (group[field] === undefined || group[field] === null || group[field] === "") {
        fail(`${label}: thiếu trường bắt buộc "${field}"`);
        errorCount++;
      }
    });

    if (group.slug) {
      if (seenSlugs.has(group.slug)) {
        fail(`${label}: slug bị trùng`);
        errorCount++;
      }
      seenSlugs.add(group.slug);
    }

    if (group.image && !fs.existsSync(path.join(PUBLIC_DIR, group.image))) {
      fail(`${label}: ảnh đại diện "${group.image}" không tồn tại trong src/public`);
      errorCount++;
    }

    if (!Array.isArray(group.variants) || group.variants.length === 0) {
      fail(`${label}: cần ít nhất 1 máy trong "variants"`);
      errorCount++;
      return;
    }

    group.variants.forEach((variant, vIndex) => {
      const vLabel = `${label} > máy #${vIndex + 1} (${variant.id || "?"})`;
      variantCount++;

      VARIANT_REQUIRED_FIELDS.forEach((field) => {
        if (variant[field] === undefined || variant[field] === null || variant[field] === "") {
          fail(`${vLabel}: thiếu trường bắt buộc "${field}"`);
          errorCount++;
        }
      });

      if (
        typeof variant.storageGb !== "undefined" &&
        (typeof variant.storageGb !== "number" || variant.storageGb <= 0)
      ) {
        fail(`${vLabel}: storageGb phải là số dương`);
        errorCount++;
      }

      if (
        typeof variant.batteryHealth !== "undefined" &&
        (typeof variant.batteryHealth !== "number" || variant.batteryHealth < 0 || variant.batteryHealth > 100)
      ) {
        fail(`${vLabel}: batteryHealth phải là số từ 0 đến 100`);
        errorCount++;
      }

      if (typeof variant.price !== "undefined" && (typeof variant.price !== "number" || variant.price <= 0)) {
        fail(`${vLabel}: price phải là số dương`);
        errorCount++;
      }

      if (variant.stockStatus && !VALID_STOCK_STATUS.includes(variant.stockStatus)) {
        fail(`${vLabel}: stockStatus không hợp lệ (chỉ chấp nhận: ${VALID_STOCK_STATUS.join(", ")})`);
        errorCount++;
      }

      if (variant.id) {
        if (seenIds.has(variant.id)) {
          fail(`${vLabel}: id bị trùng`);
          errorCount++;
        }
        seenIds.add(variant.id);
      }
    });
  });

  if (errorCount === 0) {
    console.log(`✓ data/products.json hợp lệ (${groups.length} dòng máy, ${variantCount} máy).`);
  } else {
    console.error(`\n${errorCount} lỗi được tìm thấy trong data/products.json.`);
  }
}

main();
