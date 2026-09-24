# Hướng dẫn cho Claude — quy trình cập nhật tồn kho Xóm Táo

Đây là ghi chú vận hành cho các phiên chat sau này, để không cần hỏi lại quy trình mỗi lần.

## Mô hình dữ liệu sản phẩm (quan trọng — đọc trước khi sửa `data/products.json`)

Web hiển thị theo **nhóm dòng máy**, không hiển thị từng máy riêng lẻ với ảnh riêng. Mỗi phần tử trong `data/products.json` là 1 dòng máy (vd "iPhone 14 Plus"), có đúng **1 ảnh đại diện dùng chung**, bên trong chứa mảng `variants` — mỗi variant là 1 máy vật lý cụ thể với dung lượng/màu/pin/tình trạng/giá riêng. Trên trang chi tiết, khách bấm chọn dung lượng → màu → máy cụ thể để xem giá, không cuộn qua nhiều ảnh.

```json
{
  "model": "iPhone 14 Plus",
  "line": "iPhone 14",
  "slug": "iphone-14-plus",
  "image": "/images/models/iphone-14-plus.svg",
  "variants": [
    {
      "id": "p011",
      "storageGb": 128,
      "color": "Đỏ",
      "batteryHealth": 86,
      "cosmeticCondition": "99KENG",
      "price": 11200000,
      "currency": "VND",
      "stockStatus": "in_stock",
      "addedAt": "2026-09-18",
      "updatedAt": "2026-09-18",
      "notes": ""
    }
  ]
}
```

**Không thêm trường `images` (mảng ảnh) vào từng variant** — máy không hiển thị ảnh riêng, chỉ dùng ảnh đại diện chung ở cấp `model`.

## Khi nào chạy quy trình này

Khi chủ shop nhắn kiểu "cập nhật kho", "có hàng mới", hoặc khi thấy ảnh mới trong thư mục `Kiểm kho hàng ngày/` (so với `Kiểm kho hàng ngày/đã xử lý/`).

## Các bước

1. **Đọc ảnh**: dùng công cụ đọc file để xem trực tiếp từng ảnh trong `Kiểm kho hàng ngày/` (bỏ qua thư mục con `đã xử lý/`). Nhóm các ảnh chụp cùng một máy lại với nhau (thường 1 máy có nhiều ảnh: mặt trước/sau, cài đặt pin, IMEI...). **Các ảnh này chỉ dùng để đọc và trích số liệu — không copy lên web, không gắn vào `data/products.json`.**

2. **Trích xuất thông tin bắt buộc** cho mỗi máy, gom thành một bảng thống kê trước khi đẩy lên web (model, line, storageGb, color, batteryHealth, cosmeticCondition, price cho từng máy). Có thể trình bày bảng này ra cho chủ shop xem/soát lại trước khi ghi vào JSON nếu số lượng máy nhiều.
   - `model`: tên dòng máy (vd "iPhone 13", "iPhone 15 Pro Max")
   - `line`: dòng chính để lọc danh mục, khớp với `data/categories.json` (vd "iPhone 13")
   - `storageGb`: dung lượng (số, vd 128)
   - `color`: màu máy
   - `batteryHealth`: % pin (số 0-100) — thường thấy trong ảnh chụp màn hình Cài đặt > Pin > Tình trạng pin
   - `cosmeticCondition`: mô tả tình trạng ngoại hình (vd "Như mới 99%", "Tốt 95%", "Khá 90%")
   - `price`: giá bán (VNĐ)

   **Nếu ảnh không đủ rõ để đọc một trong các trường trên (đặc biệt % pin và giá) — hỏi lại chủ shop, không tự đoán số liệu.**

3. **Cập nhật `data/products.json`**:
   - Nếu dòng máy (`model`) đã có nhóm trong file: thêm 1 phần tử mới vào mảng `variants` của nhóm đó.
   - Nếu là dòng máy mới chưa từng có: tạo nhóm mới ở cấp cao nhất (`model`, `line`, `slug`, `image`, `variants: []`) rồi thêm variant vào.
   - `variant.id`: chuỗi ngắn tăng dần, không trùng với id đã có ở bất kỳ nhóm nào.
   - `slug` (cấp nhóm): dạng không dấu `iphone-13-pro-max`, không trùng nhóm khác. Có thể dùng `require('./src/lib/slugify').slugify(model)` để tạo đúng định dạng.
   - `stockStatus`: luôn `"in_stock"`. Web chỉ hiện máy đang có hàng: máy đã bán / không còn trong bản kiểm kho thì **xoá hẳn khỏi `data/products.json`** (không đánh dấu `"sold"`). Nhóm model không còn máy nào thì xoá luôn nhóm.
   - Mỗi bản kiểm kho (file zip/ảnh) là **ảnh chụp toàn bộ kho tại thời điểm đó**: đối chiếu với JSON theo (model, dung lượng, màu, pin, giá) — máy mới thì thêm, máy không còn trong ảnh thì xoá, giá đổi thì sửa.
   - Máy có ghi chú tay (thay lưng/sửa chữa/ký gửi/khách cọc) hoặc ảnh kệ hàng khó đọc: không đăng, hỏi chủ shop.
   - `addedAt` / `updatedAt`: ngày hiện tại (định dạng `YYYY-MM-DD`).

4. **Ảnh đại diện dòng máy** (đã thử nhiều cách, đây là cách chốt — xem lịch sử bên dưới):
   - Nguồn ảnh đại diện do **chính chủ shop tự tải về và bỏ vào thư mục `Ảnh dòng máy/`** ở gốc repo (đặt tên file theo tên model cho dễ, vd `iPhone 14 Plus.jpg`, không bắt buộc đúng định dạng slug).
   - Khi thấy ảnh mới trong `Ảnh dòng máy/`: đọc ảnh để xác định đúng model, resize/nén nếu ảnh gốc nặng (>1.5MB, cạnh dài ~1600px là hợp lý), lưu vào `src/public/images/models/<slug>.jpg` (dùng `require('./src/lib/slugify').slugify(model)` để ra đúng tên file), rồi cập nhật trường `image` trong nhóm model tương ứng ở `data/products.json`.
   - Sau khi đã lấy xong, **di chuyển ảnh gốc** từ `Ảnh dòng máy/` sang `Ảnh dòng máy/đã xử lý/` (tạo thư mục con này nếu chưa có) — cùng logic với `Kiểm kho hàng ngày/đã xử lý/`.
   - Nếu dòng máy chưa có ảnh thật (chủ shop chưa kịp cung cấp), dùng tạm ảnh SVG tự sinh để trang không bị thiếu ảnh:
     ```
     node scripts/generate-model-image.js "Tên dòng máy"
     ```
     Thay bằng ảnh thật ngay khi có.
   - Nếu dòng máy đã có ảnh rồi (đã từng bán trước đó) thì dùng lại, không cần xin ảnh mới.

   **Lịch sử quyết định (để không lặp lại)**: từng thử để Claude tự tìm ảnh thật trên Wikimedia Commons (giấy phép tự do, tránh vướng bản quyền Apple) — nhưng chất lượng ảnh cộng đồng không đồng đều (nhiều ảnh cầm tay, dính thương hiệu cửa hàng khác, ảnh nghệ thuật xoá phông...), chủ shop xem không ưng, nên **không tự động tải ảnh từ Commons/internet nữa**. Cũng từng dùng SVG tự vẽ hoàn toàn (sạch nhưng trừu tượng, chủ shop muốn ảnh thật hơn). Giải pháp hiện tại: chủ shop tự chọn & tải ảnh ưng ý, Claude chỉ xử lý kỹ thuật (resize, đặt tên, gắn vào data).

5. **Không cần copy/di chuyển ảnh vào `src/public/uploads/...` nữa** — bước này đã bỏ, vì web không hiển thị ảnh riêng từng máy.

6. **Di chuyển ảnh gốc đã xử lý**: sau khi trích xong số liệu, chuyển ảnh gốc từ `Kiểm kho hàng ngày/` sang `Kiểm kho hàng ngày/đã xử lý/` để không xử lý lại lần sau.

7. **Kiểm tra schema**: chạy `npm run validate:products` — phải thấy dòng "✓ data/products.json hợp lệ" trước khi đi tiếp. Nếu lỗi, sửa lại rồi chạy lại.

8. **Commit & xác nhận trước khi push**: `git add`, `git commit` với message ngắn gọn (vd "Thêm 3 máy iPhone 13/14 mới"), sau đó **hỏi chủ shop xác nhận trước khi `git push`** vì đây là hành động ảnh hưởng tới repo dùng chung — không tự push mà không hỏi.

## Không được làm

- Không tự bịa số liệu (giá, % pin, tình trạng) khi ảnh không đủ thông tin rõ ràng.
- Không thêm sản phẩm demo/giả vào `data/products.json` — dữ liệu demo chỉ nằm ở `data/demo-products.json` (xem qua route `/preview-demo`, chỉ hoạt động ở môi trường dev).
- Không thêm ảnh riêng cho từng máy (variant) — chỉ có 1 ảnh đại diện dùng chung cho cả dòng máy.
- Không push lên GitHub mà chưa xác nhận với chủ shop.

## Thông tin liên quan khác

- Thông tin liên hệ/giới thiệu/bảng so sánh nằm ở `data/site-config.json` và `data/comparison.json` — hiện đang là placeholder, cập nhật khi chủ shop cung cấp nội dung thật.
- Chi tiết kiến trúc & lý do lựa chọn kỹ thuật: xem plan gốc hoặc README.md.
