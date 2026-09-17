# Xóm Táo — Website bán iPhone

Website trưng bày iPhone cho thương hiệu **Xóm Táo**, xây bằng Node.js (Express + EJS + Tailwind CSS). Khách xem sản phẩm và liên hệ đặt mua qua Zalo/Messenger/Hotline — không có giỏ hàng hay thanh toán online.

## Chạy thử ở máy

```bash
npm install
npm run build      # build CSS Tailwind lần đầu
npm run dev        # chạy server + tự build lại CSS khi sửa file
```

Mở `http://localhost:3000`.

## Cấu trúc thư mục

```
src/
  app.js            Express app (đọc PORT từ biến môi trường)
  routes/           index (trang chủ), products (catalog + chi tiết), pages (về chúng tôi, liên hệ)
  views/            Template EJS
  lib/data.js       Đọc/lọc dữ liệu từ thư mục data/
  public/           CSS/JS/ảnh tĩnh — public/uploads/products chứa ảnh máy thật
data/
  products.json     Nguồn dữ liệu tồn kho thật (Claude cập nhật theo yêu cầu — xem CLAUDE.md)
  site-config.json  Thông tin liên hệ, giờ mở cửa, nội dung "Về chúng tôi"
  comparison.json   Bảng so sánh Xóm Táo vs nơi khác (đang chờ nội dung thật)
  categories.json   Danh sách dòng máy hiển thị ở trang chủ/lọc sản phẩm
scripts/
  validate-products.js   Kiểm tra schema data/products.json trước khi commit
```

## Quy trình cập nhật tồn kho

Xem chi tiết ở [CLAUDE.md](./CLAUDE.md) — tóm tắt: bỏ ảnh vào `Kiểm kho hàng ngày/`, nhắn Claude "cập nhật kho tồn", Claude tự đọc ảnh, cập nhật `data/products.json` và ảnh trong `src/public/uploads/products/`, sau đó xác nhận trước khi push lên GitHub.

## Deploy

Xem [DEPLOY.md](./DEPLOY.md) để biết cách import repo GitHub vào Hostinger hPanel (gói Business Web Hosting trở lên).

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (nodemon) + theo dõi Tailwind |
| `npm run build` | Build CSS production (Hostinger cũng chạy lệnh này khi deploy) |
| `npm start` | Chạy server production |
| `npm run validate:products` | Kiểm tra schema `data/products.json` |
