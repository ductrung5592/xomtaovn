// Xuất tồn kho ra Excel: node scripts/export-inventory-xlsx.js [đường-dẫn-file.xlsx]
// Cần thư viện xlsx (không cài vào dự án): npm install --no-save xlsx
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const root = path.join(__dirname, "..");
const products = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));
const fmtStorage = (gb) => (gb >= 1024 ? gb / 1024 + "TB" : gb + "GB");
const today = new Date().toISOString().slice(0, 10);
const [y, m, d] = today.split("-");
const out = process.argv[2] || path.join(root, `Tồn kho Xóm Táo ${d}-${m}-${y}.xlsx`);

// Sheet 1: từng máy
const rows = [];
for (const g of products) {
  for (const v of g.variants) {
    rows.push({ g, v });
  }
}
rows.sort((a, b) => a.g.model.localeCompare(b.g.model, "vi") || a.v.storageGb - b.v.storageGb || a.v.price - b.v.price);

const header = ["STT", "Dòng máy", "Dung lượng", "Màu", "Pin (%)", "Tình trạng", "Giá bán (VNĐ)", "Mã máy", "Ngày nhập"];
const aoa = [header];
rows.forEach(({ g, v }, i) => {
  aoa.push([i + 1, g.model, fmtStorage(v.storageGb), v.color, v.batteryHealth, v.cosmeticCondition, v.price, v.id, v.addedAt]);
});
aoa.push([]);
aoa.push(["", "TỔNG", rows.length + " máy", "", "", "", rows.reduce((s, r) => s + r.v.price, 0), "", ""]);
const ws1 = XLSX.utils.aoa_to_sheet(aoa);
ws1["!cols"] = [{ wch: 6 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 9 }, { wch: 13 }, { wch: 16 }, { wch: 9 }, { wch: 12 }];
ws1["!autofilter"] = { ref: `A1:I${rows.length + 1}` };
ws1["!freeze"] = { xSplit: 0, ySplit: 1 };
for (let r = 1; r < aoa.length; r++) {
  const c = ws1[XLSX.utils.encode_cell({ r, c: 6 })];
  if (c && typeof c.v === "number") c.z = "#,##0";
}

// Sheet 2: tổng hợp theo dòng máy + dung lượng
const map = new Map();
for (const { g, v } of rows) {
  const k = g.model + "|" + v.storageGb;
  if (!map.has(k)) map.set(k, { model: g.model, gb: v.storageGb, prices: [] });
  map.get(k).prices.push(v.price);
}
const sum = [["Dòng máy", "Dung lượng", "Số lượng", "Giá thấp nhất", "Giá cao nhất"]];
[...map.values()]
  .sort((a, b) => a.model.localeCompare(b.model, "vi") || a.gb - b.gb)
  .forEach((s) => sum.push([s.model, fmtStorage(s.gb), s.prices.length, Math.min(...s.prices), Math.max(...s.prices)]));
const ws2 = XLSX.utils.aoa_to_sheet(sum);
ws2["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
for (let r = 1; r < sum.length; r++) for (const c of [3, 4]) ws2[XLSX.utils.encode_cell({ r, c })].z = "#,##0";

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws1, "Tồn kho");
XLSX.utils.book_append_sheet(wb, ws2, "Tổng hợp");
XLSX.writeFile(wb, out);
console.log("✓ Đã xuất", rows.length, "máy ->", out);
