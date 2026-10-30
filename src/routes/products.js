const express = require("express");
const router = express.Router();
const {
  getRealProducts,
  getCategories,
  getProductGroupBySlug,
  filterProducts,
  formatPriceVND,
  formatStorage,
  getFilterOptions,
  getPriceRange,
  getInStockVariants,
  getGroupStorages,
  getSiteConfig,
} = require("../lib/data");
const { breadcrumbSchema, productSchema } = require("../lib/seo");

function priceInMillions(amount) {
  return (amount / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " triệu";
}

router.get("/", (req, res) => {
  const { line, storage, condition, maxPrice } = req.query;
  const all = getRealProducts();
  const filtered = filterProducts(all, { line, storage, condition, maxPrice });
  const categories = getCategories();
  const filterOptions = getFilterOptions(all);

  // Chỉ trang "tất cả" và trang theo dòng máy được Google lập chỉ mục; các tổ hợp lọc khác thì không.
  const hasOtherFilters = Boolean(storage || condition || maxPrice);
  const hasLine = Boolean(line) && filtered.length > 0;
  const noindex = hasOtherFilters || (Boolean(line) && filtered.length === 0);
  const name = hasLine ? line : "iPhone";

  res.render("catalog", {
    pageTitle: hasLine ? `${line} cũ, zin 100% tại Hà Đông` : "Bảng giá iPhone cũ zin 100% tại Hà Đông",
    heading: `${name} cũ zin 100% tại Hà Đông`,
    metaDescription: `Danh sách ${name} cũ đang có tại Xóm Táo, 60 Trần Phú, Hà Đông. Giá rõ từng máy theo dung lượng, màu, % pin. Kiểm tra thoải mái cùng thợ độc lập.`,
    noindex,
    canonicalPath: hasLine ? `/san-pham?line=${encodeURIComponent(line)}` : "/san-pham",
    products: filtered,
    categories,
    filterOptions,
    filters: { line, storage, condition, maxPrice },
    formatPriceVND,
    formatStorage,
    getPriceRange,
    isDemoView: false,
  });
});

router.get("/:slug", (req, res, next) => {
  const includeDemo = process.env.NODE_ENV !== "production";
  const product = getProductGroupBySlug(req.params.slug, { includeDemo });
  if (!product) return next();

  const priceRange = getPriceRange(product);
  const inStock = getInStockVariants(product);
  const storages = getGroupStorages(product).map(formatStorage);
  const metaDescription = `${product.model} cũ zin 100% tại Xóm Táo, 60 Trần Phú, Hà Đông: ${inStock.length} máy có sẵn, giá từ ${priceInMillions(priceRange.min)}. Kiểm tra thoải mái cùng thợ độc lập.`;
  const relatedModels = getRealProducts().filter((g) => g.line === product.line && g.slug !== product.slug);
  const siteConfig = getSiteConfig();

  res.render("product-detail", {
    pageTitle: `Giá ${product.model} cũ, zin 100% tại Hà Đông`,
    metaDescription,
    ogImage: product.image,
    jsonLd: [
      productSchema(siteConfig, product, metaDescription, priceRange, inStock.length),
      breadcrumbSchema(siteConfig, [
        { name: "Trang chủ", path: "/" },
        { name: "Sản phẩm", path: "/san-pham" },
        { name: product.model, path: `/san-pham/${product.slug}` },
      ]),
    ],
    noindex: Boolean(product.isDemo),
    priceRange,
    inStockCount: inStock.length,
    storages,
    colors: [...new Set(inStock.map((v) => v.color))],
    relatedModels,
    product,
    formatPriceVND,
    formatStorage,
    getPriceRange,
  });
});

module.exports = router;
