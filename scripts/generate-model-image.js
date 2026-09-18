// Tạo ảnh đại diện (SVG) cho 1 dòng máy iPhone, dùng khi kho có model mới chưa có ảnh.
// Cách dùng: node scripts/generate-model-image.js "iPhone 14 Plus"
const fs = require("fs");
const path = require("path");
const { slugify } = require("../src/lib/slugify");

const OUT_DIR = path.join(__dirname, "..", "src", "public", "images", "models");

function lensCount(model) {
  if (/\bPro\b/i.test(model)) return 3;
  if (/\b(SE|7|8)\b/i.test(model) && !/Plus/i.test(model)) return 1;
  return 2;
}

function bodyHeight(model) {
  if (/Pro Max|Plus/i.test(model)) return 320;
  if (/mini/i.test(model)) return 270;
  return 300;
}

function lensMarkup(count) {
  const cx = 178;
  const cy = 108;
  if (count === 1) {
    return `<circle cx="${cx}" cy="${cy}" r="13" fill="#0A0A0C" stroke="#C9A45C" stroke-width="2"/>`;
  }
  if (count === 2) {
    return `
      <circle cx="${cx}" cy="${cy}" r="12" fill="#0A0A0C" stroke="#C9A45C" stroke-width="2"/>
      <circle cx="${cx + 26}" cy="${cy + 18}" r="12" fill="#0A0A0C" stroke="#C9A45C" stroke-width="2"/>`;
  }
  return `
    <circle cx="${cx}" cy="${cy}" r="12" fill="#0A0A0C" stroke="#C9A45C" stroke-width="2"/>
    <circle cx="${cx + 28}" cy="${cy}" r="12" fill="#0A0A0C" stroke="#C9A45C" stroke-width="2"/>
    <circle cx="${cx + 14}" cy="${cy + 24}" r="12" fill="#0A0A0C" stroke="#C9A45C" stroke-width="2"/>`;
}

function buildSvg(model) {
  const h = bodyHeight(model);
  const yTop = 90 + (320 - h) / 2;
  return `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ảnh đại diện ${model}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1B1B1F"/>
      <stop offset="100%" stop-color="#0A0A0C"/>
    </linearGradient>
    <linearGradient id="phone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3A3A41"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <rect x="130" y="${yTop}" width="140" height="${h}" rx="34" fill="url(#phone)" stroke="#C9A45C" stroke-width="2"/>
  <rect x="145" y="${yTop + 20}" width="110" height="${h - 40}" rx="18" fill="#0A0A0C"/>
  <rect x="160" y="${yTop + 32}" width="52" height="52" rx="14" fill="#1B1B1F"/>
  ${lensMarkup(lensCount(model))}
  <text x="200" y="452" text-anchor="middle" font-family="Manrope, sans-serif" font-size="18" fill="#D8B978">${model}</text>
  <text x="200" y="474" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#F4EFE6" opacity="0.6">Ảnh đại diện dòng máy</text>
</svg>
`;
}

function generate(model) {
  const slug = slugify(model);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${slug}.svg`);
  fs.writeFileSync(outPath, buildSvg(model), "utf-8");
  console.log(`✓ Đã tạo ${path.relative(process.cwd(), outPath)}`);
  return `/images/models/${slug}.svg`;
}

if (require.main === module) {
  const model = process.argv.slice(2).join(" ").trim();
  if (!model) {
    console.error("Dùng: node scripts/generate-model-image.js \"Tên dòng máy\"");
    process.exit(1);
  }
  generate(model);
}

module.exports = { generate, buildSvg };
