# Hướng dẫn cho Claude — quy trình cập nhật tồn kho Xóm Táo

Đây là ghi chú vận hành cho các phiên chat sau này, để không cần hỏi lại quy trình mỗi lần.

## Khi nào chạy quy trình này

Khi chủ shop nhắn kiểu "cập nhật kho", "có hàng mới", hoặc khi thấy ảnh mới trong thư mục `Kiểm kho hàng ngày/` (so với `Kiểm kho hàng ngày/đã xử lý/`).

## Các bước

1. **Đọc ảnh**: dùng công cụ đọc file để xem trực tiếp từng ảnh trong `Kiểm kho hàng ngày/` (bỏ qua thư mục con `đã xử lý/`). Nhóm các ảnh chụp cùng một máy lại với nhau (thường 1 máy có nhiều ảnh: mặt trước/sau, cài đặt pin, IMEI...).

2. **Trích xuất thông tin bắt buộc** cho mỗi máy:
   - `model`: tên dòng máy (vd "iPhone 13", "iPhone 15 Pro Max")
   - `line`: dòng chính để lọc danh mục, khớp với `data/categories.json` (vd "iPhone 13")
   - `storageGb`: dung lượng (số, vd 128)
   - `color`: màu máy
   - `batteryHealth`: % pin (số 0-100) — thường thấy trong ảnh chụp màn hình Cài đặt > Pin > Tình trạng pin
   - `cosmeticCondition`: mô tả tình trạng ngoại hình (vd "Như mới 99%", "Tốt 95%", "Khá 90%")
   - `price`: giá bán (VNĐ)

   **Nếu ảnh không đủ rõ để đọc một trong các trường trên (đặc biệt % pin và giá) — hỏi lại chủ shop, không tự đoán số liệu.**

3. **Cập nhật `data/products.json`**:
   - Thêm entry mới hoặc sửa entry đã có (nếu cùng máy được chụp lại/cập nhật giá).
   - `id`: chuỗi ngẫu nhiên ngắn hoặc tăng dần, không trùng.
   - `slug`: dạng `iphone-13-128gb-xanh-01`, không dấu, không trùng.
   - `stockStatus`: `"in_stock"` mặc định, chuyển `"sold"` khi anh báo đã bán.
   - `addedAt` / `updatedAt`: ngày hiện tại (định dạng `YYYY-MM-DD`).
   - `images`: mảng đường dẫn tới ảnh đã copy, dạng `/uploads/products/<slug>/1.jpg`.

4. **Copy ảnh**: copy (không di chuyển) các ảnh liên quan vào `src/public/uploads/products/<slug>/`, đặt tên `1.jpg`, `2.jpg`... Nén/resize nếu ảnh gốc quá nặng (>2MB) để trang tải nhanh.

5. **Di chuyển ảnh gốc đã xử lý**: chuyển ảnh gốc từ `Kiểm kho hàng ngày/` sang `Kiểm kho hàng ngày/đã xử lý/` để không xử lý lại lần sau.

6. **Kiểm tra schema**: chạy `npm run validate:products` — phải thấy dòng "✓ data/products.json hợp lệ" trước khi đi tiếp. Nếu lỗi, sửa lại rồi chạy lại.

7. **Commit & xác nhận trước khi push**: `git add`, `git commit` với message ngắn gọn (vd "Thêm 3 máy iPhone 13/14 mới"), sau đó **hỏi chủ shop xác nhận trước khi `git push`** vì đây là hành động ảnh hưởng tới repo dùng chung — không tự push mà không hỏi.

## Không được làm

- Không tự bịa số liệu (giá, % pin, tình trạng) khi ảnh không đủ thông tin rõ ràng.
- Không thêm sản phẩm demo/giả vào `data/products.json` — dữ liệu demo chỉ nằm ở `data/demo-products.json` (xem qua route `/preview-demo`, chỉ hoạt động ở môi trường dev).
- Không push lên GitHub mà chưa xác nhận với chủ shop.

## Thông tin liên quan khác

- Thông tin liên hệ/giới thiệu/bảng so sánh nằm ở `data/site-config.json` và `data/comparison.json` — hiện đang là placeholder, cập nhật khi chủ shop cung cấp nội dung thật.
- Chi tiết kiến trúc & lý do lựa chọn kỹ thuật: xem plan gốc hoặc README.md.
