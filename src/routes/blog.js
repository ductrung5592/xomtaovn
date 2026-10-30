const express = require("express");
const router = express.Router();
const { getSiteConfig } = require("../lib/data");
const { getPosts, getPostBySlug, formatPostDate } = require("../lib/posts");
const { articleSchema, faqSchema, localBusinessSchema, breadcrumbSchema } = require("../lib/seo");

router.get("/", (req, res) => {
  res.render("blog-list", {
    pageTitle: "Blog kinh nghiệm mua iPhone cũ",
    metaDescription:
      "Kinh nghiệm chọn và kiểm tra iPhone cũ, phân biệt máy zin với máy dựng, từ cửa hàng Xóm Táo tại 60 Trần Phú, Hà Đông.",
    posts: getPosts(),
    formatPostDate,
  });
});

router.get("/:slug", (req, res, next) => {
  const post = getPostBySlug(req.params.slug);
  if (!post) return next();

  const siteConfig = getSiteConfig();
  const jsonLd = [
    articleSchema(siteConfig, post),
    breadcrumbSchema(siteConfig, [
      { name: "Trang chủ", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];
  if (post.faq.length > 0) jsonLd.push(faqSchema(post.faq));
  if (post.localBusiness) jsonLd.push(localBusinessSchema(siteConfig));

  res.render("blog-post", {
    pageTitle: post.title,
    metaDescription: post.description,
    ogImage: post.image,
    ogType: "article",
    jsonLd,
    post,
    formatPostDate,
  });
});

module.exports = router;
