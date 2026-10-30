const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const POSTS_DIR = path.join(__dirname, "..", "..", "data", "posts");
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

const CATEGORY_LABELS = {
  A: "Mua iPhone tại Hà Đông",
  B: "Máy zin & kiểm tra máy",
  C: "Tư vấn chọn máy",
  D: "Theo mùa",
  E: "Tin công nghệ",
};

// YAML có thể trả về Date hoặc chuỗi tuỳ cách viết, nên quy hết về ISO giờ Việt Nam.
function toVietnamIso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 19) + "+07:00";
}

function formatPostDate(iso) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function toList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePost(fileName) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf-8");
  const { data, content } = matter(raw);
  const date = toVietnamIso(data.date);
  if (!data.title || !data.description || !date) {
    throw new Error("thiếu title, description hoặc date hợp lệ");
  }

  return {
    title: data.title,
    description: data.description,
    slug: data.slug || path.basename(fileName, ".md"),
    date,
    updated: toVietnamIso(data.updated) || date,
    category: data.category,
    categoryLabel: CATEGORY_LABELS[data.category] || "Bài viết",
    keywords: toList(data.keywords),
    image: data.image || null,
    imageAlt: data.imageAlt || data.title,
    sources: toList(data.sources).map((s) => (typeof s === "string" ? { title: s, url: s } : s)),
    draft: Boolean(data.draft) && data.draft !== "false",
    faq: toList(data.faq).filter((item) => item && item.q && item.a),
    localBusiness: data.localBusiness === true,
    html: marked.parse(content),
  };
}

// Bài lỗi chỉ bị bỏ qua và ghi log, để một file sai không làm hỏng /blog và sitemap.
function getPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .flatMap((fileName) => {
      try {
        return [parsePost(fileName)];
      } catch (err) {
        console.error(`Bỏ qua bài ${fileName}: ${err.message}`);
        return [];
      }
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getPostBySlug(slug) {
  return getPosts().find((post) => post.slug === slug) || null;
}

module.exports = { getPosts, getPostBySlug, formatPostDate };
