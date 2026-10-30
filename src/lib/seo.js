// Dữ liệu cho SEO: JSON-LD (schema.org) và sitemap. Chỉ dùng số liệu thật từ thư mục data/.

function absoluteUrl(siteConfig, pathOrUrl) {
  return new URL(pathOrUrl, siteConfig.siteUrl).href;
}

function localBusinessSchema(siteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": absoluteUrl(siteConfig, "/#store"),
    name: siteConfig.shopName,
    description: siteConfig.tagline,
    url: absoluteUrl(siteConfig, "/"),
    image: absoluteUrl(siteConfig, "/images/hero-cover.jpg"),
    logo: absoluteUrl(siteConfig, "/images/logo.png"),
    telephone: siteConfig.seo.telephone,
    address: { "@type": "PostalAddress", ...siteConfig.seo.address },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: siteConfig.seo.opens,
      closes: siteConfig.seo.closes,
    },
  };
}

function breadcrumbSchema(siteConfig, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(siteConfig, item.path),
    })),
  };
}

function productSchema(siteConfig, group, description, priceRange, inStockCount) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: group.model,
    image: absoluteUrl(siteConfig, group.image),
    description,
    brand: { "@type": "Brand", name: "Apple" },
    offers: {
      "@type": "AggregateOffer",
      url: absoluteUrl(siteConfig, `/san-pham/${group.slug}`),
      priceCurrency: "VND",
      lowPrice: priceRange.min,
      highPrice: priceRange.max,
      offerCount: inStockCount,
      availability: inStockCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": absoluteUrl(siteConfig, "/#store") },
    },
  };
}

function articleSchema(siteConfig, post) {
  const url = absoluteUrl(siteConfig, `/blog/${post.slug}`);
  const organization = { "@type": "Organization", name: siteConfig.shopName, url: absoluteUrl(siteConfig, "/") };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: absoluteUrl(siteConfig, post.image || "/images/hero-cover.jpg"),
    datePublished: post.date,
    dateModified: post.updated,
    inLanguage: "vi",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: organization,
    publisher: {
      ...organization,
      logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig, "/images/logo.png") },
    },
    ...(post.keywords.length > 0 && { keywords: post.keywords.join(", ") }),
  };
}

function faqSchema(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSitemap(siteConfig, groups, posts = []) {
  const staticPaths = ["/", "/san-pham", "/bao-hanh", "/gioi-thieu", "/lien-he", "/blog"];
  const latestUpdate = (variants) =>
    variants.map((v) => v.updatedAt).filter(Boolean).sort().pop();

  const entries = staticPaths.map((p) => ({ loc: p }));
  const lines = [...new Set(groups.map((g) => g.line))];
  lines.forEach((line) => {
    entries.push({ loc: `/san-pham?line=${encodeURIComponent(line)}` });
  });
  groups.forEach((g) => {
    entries.push({ loc: `/san-pham/${g.slug}`, lastmod: latestUpdate(g.variants) });
  });
  posts.forEach((post) => {
    entries.push({ loc: `/blog/${post.slug}`, lastmod: post.updated.slice(0, 10) });
  });

  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : "";
      return `  <url><loc>${escapeXml(absoluteUrl(siteConfig, e.loc))}</loc>${lastmod}</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

module.exports = { absoluteUrl, localBusinessSchema, breadcrumbSchema, productSchema, articleSchema, faqSchema, buildSitemap };
