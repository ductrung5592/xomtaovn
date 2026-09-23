# Hướng dẫn deploy Xóm Táo lên GitHub + Hostinger

Việc đăng nhập GitHub/Hostinger là do anh tự thao tác (Claude không đăng nhập thay). Dưới đây là các bước.

## 1. Tạo repo GitHub

1. Đăng nhập [github.com](https://github.com), tạo repository mới (private hoặc public tuỳ anh), **không** tick "Add README" (repo đã có sẵn code).
2. Copy URL repo (dạng `https://github.com/<username>/<repo>.git`).
3. Gửi URL đó cho Claude trong chat — Claude sẽ chạy:
   ```bash
   git init
   git remote add origin <URL repo>
   git add .
   git commit -m "Khởi tạo website Xóm Táo"
   git push -u origin main
   ```
   (Claude sẽ hỏi xác nhận trước khi push.)

## 2. Mua domain + gói Hostinger

- Cần gói **Business Web Hosting** trở lên (hoặc Cloud Startup/Professional/Enterprise) — các gói này hỗ trợ chạy Node.js app. ([Hostinger Node.js hosting options](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/))
- Trỏ domain về Hostinger theo hướng dẫn của Hostinger khi mua domain.

## 3. Tạo Node.js App trong hPanel

1. Vào **hPanel → Websites → Add Website → Node.js web app**.
2. Chọn **Import Git repository**, đăng nhập/kết nối GitHub, chọn đúng repo vừa tạo.
3. Hostinger sẽ tự nhận diện đây là app Node.js và gợi ý cấu hình — kiểm tra/điền:
   - **Node version**: 18, 20, 22 hoặc 24 (chọn bản mới nhất được hỗ trợ)
   - **Build command**: `npm run build`
   - **Start command / Entry file**: `npm start` (chạy `src/app.js`)
   - **Branch**: `main`
4. Thêm biến môi trường nếu cần (vd `NODE_ENV=production`) trong phần Environment Variables của app.
5. Bấm **Deploy**. Hostinger sẽ `npm install`, chạy build command, rồi khởi động app.
6. Trỏ domain đã mua vào Node.js app này trong phần cấu hình website.

Nguồn tham khảo: [Node.js — Hostinger Help Center](https://www.hostinger.com/support/hpanel/node-js/), [Creating a Node.js App](https://docs.hostinger.com/node.js/creating-an-app), [How to add a Node.js web app in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

## 4. Cập nhật sau khi đã deploy

Mỗi khi Claude cập nhật tồn kho và push code mới lên nhánh `main` (xem [CLAUDE.md](./CLAUDE.md)), Hostinger sẽ tự động deploy lại nếu anh bật **Auto Deploy** trong hPanel (Websites → app → Git → Auto deploy on push). Nếu không bật, anh cần vào hPanel bấm **Deploy** thủ công sau mỗi lần Claude báo đã push xong.

## 5. Kiểm tra sau khi deploy

- Mở domain thật, kiểm tra trang chủ/sản phẩm/về chúng tôi/liên hệ hiển thị đúng.
- Kiểm tra nút Zalo/Messenger/Hotline trỏ đúng số/link thật (không còn placeholder).
- Kiểm tra ảnh sản phẩm tải được (không bị 404) — ảnh nằm trong `src/public/images/models`, cần đảm bảo các ảnh đã được commit cùng code.
