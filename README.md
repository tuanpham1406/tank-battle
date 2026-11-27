# Tank Battle — Anh Tuấn

Game xe tăng 3D với những trận chiến trên sa mạc. Điều khiển xe, ngắm bắn, tận dụng vật cản và chiến đấu để giành điểm cao nhất. Chơi một mình chống lại các đợt tấn công của AI hoặc lập phòng đối đầu cùng bạn bè, tối đa 8 người.

## Chạy

Clone repo này và mở thư mục `tank-battle` bằng VS Code. Máy cần Node.js 22 hoặc mới hơn.

```sh
npm ci --ignore-scripts
npm start
```

Mở http://127.0.0.1:5280. Server mặc định chỉ lắng nghe trên máy của bạn.
Cách cũ `python3 -m http.server` vẫn chơi một người được, không hỗ trợ multiplayer.
Ctrl+C ở terminal để tắt server.

## Nhiều người

Nhập tên (mặc định Anh Tuấn), mã phòng rồi chọn **Vào phòng nhiều người**.
Người đầu tiên tự tạo phòng; những người nhập cùng mã sẽ vào cùng trận.
Có thể mở hai tab để thử trên một máy, đặt hai tên khác nhau.
Đây là PvP, không sinh bot trong phòng. Mỗi lần hạ đối thủ được 100 điểm,
xe hồi sinh sau 3 giây và được bảo vệ 2 giây. Điểm phòng chỉ lưu trong RAM;
rời phòng mất điểm, phòng trống bị xóa. Nút **Rời phòng** trở về menu.

Để chơi bằng các máy trên cùng mạng tin cậy, dừng server rồi chạy:

```sh
HOST=0.0.0.0 npm start
```

Máy khác truy cập `http://<IP-LAN-của-máy-chạy-server>:5280`, nhập cùng mã phòng.
Có thể cần cho phép kết nối đến Node.js trong firewall của macOS. Không tắt toàn bộ
firewall, không mở cổng router và không dùng tunnel công khai chỉ để thử LAN.
Server không có tài khoản, mật khẩu phòng hay TLS, phù hợp demo local/LAN;
chưa phải dịch vụ Internet đã được bảo vệ và vận hành thực tế.
Chưa thử nghiệm giữa hai máy vật lý hoặc mạng có độ trễ cao.

## Điều khiển và độ mượt

W/S hoặc ↑/↓ tiến lùi; A/D hoặc ←/→ xoay; chuột ngắm; chuột trái hoặc Space bắn.
Có tăng/giảm tốc mềm và quán tính quay, camera bám mềm.
Xe của mình được dự đoán cục bộ rồi sửa theo server; xe khác được nội suy.
Server mô phỏng 60 tick/giây, gửi trạng thái 20 lần/giây; đầu vào 30 lần/giây.
Server quyết định va chạm, sát thương, hồi sinh, điểm và thời gian hồi bắn.
Chưa có bù độ trễ cho đạn hoặc replay đầu vào theo sequence.

Esc / nút tạm dừng dừng phần chơi solo. Trong multiplayer, thao tác này chỉ
ngừng điều khiển xe của bạn; trận và sát thương vẫn tiếp tục. Chuyển tab/mất focus
cũng ngừng đầu vào để tránh xe tiếp tục chạy hoặc bắn.

Nút Toàn màn hình và tắt/bật âm thanh hỗ trợ quay video. macOS: ⌘⇧5 để ghi hình.
Tên người chơi hiển thị góc phải và phía trên xe trong multiplayer.

## Dữ liệu và phụ thuộc

Không có analytics, upload, đăng nhập hoặc CDN khi chơi. Thư viện Three.js 0.170.0
được lưu trong `vendor/` kèm giấy phép MIT. `ws` chạy phía server và được khóa phiên
bản trong package-lock.json. npm ci cần mạng khi tải phụ thuộc; sau đó chơi local
không cần Internet. Trình duyệt hoặc ứng dụng khác vẫn có thể có lưu lượng riêng.
Tên người chơi, vị trí và hành động được gửi tới server bạn chọn kết nối; các người
trong cùng phòng nhận tên, máu, điểm và trạng thái trận. Kỷ lục solo lưu localStorage.
Server không ghi log tên hay nội dung trận vào file. Không truyền dữ liệu công ty
qua tên hoặc mã phòng. Tắt server để ngừng nhận kết nối.

## Kiểm tra

```sh
npm test
```

Kiểm tra mô phỏng: tăng tốc/dừng, vật cản, sát thương, điểm, hồi sinh và đầu vào hết hạn.
Đã kiểm tra Chrome headless với hai trang: vào cùng phòng, tên và số lượng người,
gửi thao tác di chuyển/bắn, cập nhật rời phòng, không có runtime exception.
Chưa đo FPS hay kết luận độ mượt trên mọi máy.

AI solo có đánh lái tránh vật cản đơn giản, chưa dùng NavMesh. Bản chơi dành cho máy
tính có chuột/bàn phím và WebGL. Đồ họa/âm thanh đều dựng bằng code.
