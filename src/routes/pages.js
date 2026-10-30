const express = require("express");
const router = express.Router();
const {
  getDemoProducts,
  getCategories,
  formatPriceVND,
  formatStorage,
  getFilterOptions,
  getPriceRange,
  getWarrantyPolicy,
  getSiteConfig,
} = require("../lib/data");
const { localBusinessSchema } = require("../lib/seo");

router.get("/gioi-thieu", (req, res) => {
  res.render("about", {
    pageTitle: "Giới thiệu cửa hàng iPhone cũ tại Hà Đông",
    metaDescription:
      "Xóm Táo thành lập từ 2020, chuyên iPhone cũ zin 100% tại 60 Trần Phú, Hà Đông. Tiêu chí: Uy tín để thành công, minh bạch trong từng giao dịch.",
  });
});

router.get("/lien-he", (req, res) => {
  res.render("contact", {
    pageTitle: "Liên hệ, địa chỉ 60 Trần Phú, Hà Đông",
    metaDescription:
      "Địa chỉ Xóm Táo: 60 Trần Phú, Hà Đông, Hà Nội. Mở cửa 9h00 - 22h00 tất cả các ngày. Hotline và Zalo: 0876545888, hoặc nhắn Messenger.",
    jsonLd: [localBusinessSchema(getSiteConfig())],
  });
});

router.get("/bao-hanh", (req, res) => {
  res.render("warranty", {
    pageTitle: "Chính sách bảo hành, thu cũ đổi mới iPhone",
    metaDescription:
      "Bảo hành iPhone tại Xóm Táo: đổi miễn phí 7 ngày, lỗi 1 đổi 1 trong 30 ngày, phần mềm bảo hành trọn đời máy. Xem điều kiện và chính sách thu cũ đổi mới.",
    policy: getWarrantyPolicy(),
  });
});

// Chỉ dùng để xem trước giao diện với dữ liệu minh hoạ — không hoạt động ở production.
router.get("/preview-demo", (req, res, next) => {
  if (process.env.NODE_ENV === "production") return next();

  const products = getDemoProducts();
  const categories = getCategories();
  const filterOptions = getFilterOptions(products);

  res.render("catalog", {
    pageTitle: "Xem trước giao diện (Demo)",
    heading: "Sản phẩm",
    noindex: true,
    products,
    categories,
    filterOptions,
    filters: {},
    formatPriceVND,
    formatStorage,
    getPriceRange,
    isDemoView: true,
  });
});

module.exports = router;
