# Tank Battle — Anh Tuấn

Game xe tăng 3D với những trận chiến trên sa mạc. Điều khiển xe, ngắm bắn, tận dụng vật cản và chiến đấu để giành điểm cao nhất. Chơi một mình chống lại các đợt tấn công của AI hoặc lập phòng đối đầu cùng bạn bè, tối đa 8 người.

## Chạy

Mở thư mục `TankBattleWeb` bằng VS Code. Máy cần Node.js 22 hoặc mới hơn.

```sh
npm ci --ignore-scripts
npm start
```

Mở http://127.0.0.1:5280. Server mặc định chỉ lắng nghe trên máy của bạn.
Cách cũ `python3 -m http.server` vẫn chơi một người được, không hỗ trợ multiplayer.
Ctrl+C ở terminal để tắt server.

## Bản đồ và màu xe

Ở màn hình chờ, xe tăng 3D được hiển thị trên bệ xem trước. Chọn một trong 6 màu
sơn để đổi màu ngay; kéo chuột hoặc focus khung xe rồi dùng phím trái/phải để xoay.
Model xem trước dùng chung với model trong trận. Chọn thẻ **Chiến trường** có ảnh
cảnh 3D để xem map.
Chọn **Một người** hoặc **Cùng bạn bè**; mã phòng chỉ xuất hiện ở chế độ nhiều người.
Hiệu ứng thời tiết được đặt trong mục **Hiệu ứng & tuỳ chọn** để màn hình gọn hơn.
Có Sa mạc vàng (88 × 88 m), Rừng sương (96 × 96 m), Đèo núi tuyết (104 × 104 m).
Cây và các khối đá trong sân là vật cản có thể phá hủy; núi/cây ngoài tường là cảnh nền.
Mặt sân vẫn bằng phẳng để lái xe; đây chưa phải mô phỏng leo núi hoặc địa hình dốc.
Mỗi map có thời tiết bụi cát, mưa hoặc tuyết; có thể bỏ chọn **Hiệu ứng thời tiết**.
Màu xe chỉ thay ngoại hình, không thay sức mạnh. Trong multiplayer người tạo phòng
quyết định bản đồ; người vào sau tự dùng bản đồ của phòng dù đã chọn map khác.
Màu xe từng người được đồng bộ cho cả phòng. Muốn đổi map hãy rời phòng và tạo
mã phòng mới, hoặc chờ phòng cũ trống hoàn toàn.

## Va chạm và điều khiển

Va chạm của đá lấy từ cùng đa diện và biến đổi đang dùng để vẽ, kể cả sau khi đá
bị hư hại và co nhỏ. Cây chỉ chặn bằng thân, phần tán mềm được nâng lên trên thân
xe. Hình va chạm thân xe có chiều rộng/dài và hướng xoay của model, thay cho bán
kính tròn cố định. Xe có thể trượt dọc cạnh vật cản khi tiến xiên vào cạnh; vẫn bị
chặn nếu đâm trực diện. Minimap vẽ cùng đường bao vật cản. Server, AI solo và dự
đoán ở client sử dụng cùng quy tắc va chạm.

## Địa hình và phá hủy vật cản

- Nước nông: 50% tốc độ; bùn: 60%; tuyết dày: 45%. Đây là tốc độ mục tiêu,
  xe giảm/tăng tốc dần khi đi vào hoặc ra khỏi vùng. Tốc độ quay thân cũng giảm.
  Nòng súng vẫn ngắm bình thường. Các vùng có bề mặt riêng và vòng gợn/dấu bánh xe;
  dòng trạng thái dưới thanh máu báo loại bề mặt và mức tốc độ.
- Xe AI trong solo và tất cả người chơi multiplayer đều chịu ảnh hưởng địa hình.
  Tắt thời tiết chỉ tắt hạt mưa/tuyết/bụi, không vô hiệu hóa giảm tốc hoặc vật cản.
- Cây có 75 máu, đá lớn có 125 máu, mỗi viên đạn gây 25 sát thương cho vật cản
  (3 viên để hạ cây, 5 viên để phá đá). Không hiện thanh máu của cây/đá.
- Cây bị sẫm màu, đổi màu lá, mất tán lá và nghiêng dần trước khi đổ, còn lại gốc
  và khúc gỗ trang trí. Đá sẫm màu, có vết nứt rồi vỡ thành đống đá vụn.
  Đạn gây vụn gỗ/lá hoặc vụn đá kèm âm thanh khác nhau.
- Vật đã phá không chặn xe hay đạn nữa. Tường pháo đài và ranh giới sân không phá
  được; đá vụn nhỏ, cây/núi ngoài sân là cảnh nền không có máu.
- Trong multiplayer, server quyết định sát thương vật cản, lưu trạng thái theo
  phòng và gửi cho cả người vào sau. Vật cản giữ nguyên trạng thái qua hồi sinh.
  Chơi lại solo hoặc tạo phòng mới sẽ phục hồi vật cản; phòng khác không bị ảnh hưởng.

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

Minimap ở góc phải hiển thị toàn sân: bạn màu xanh, đối thủ màu đỏ, vật cản màu
xám. Mũi tên xanh chỉ hướng thân xe; xe đã bị hạ và vật cản đã phá sẽ không hiện.
Các vùng nước/bùn/tuyết cũng được vẽ để định hướng.

Các nút âm thanh, toàn màn hình, tạm dừng và rời phòng dùng icon, có nhãn khi rê
chuột hoặc focus bằng bàn phím; icon đổi theo trạng thái. Tab trình duyệt có
favicon xe tăng và hiển thị tên map/người chơi khi vào trận.

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

Kiểm tra mô phỏng: tăng tốc/dừng, vật cản, sát thương, điểm, hồi sinh, đầu vào hết hạn, điểm sinh an toàn trên cả 3 map, giá trị map/màu xe không hợp lệ, giảm tốc địa hình, máu vật cản, đường đi sau phá hủy và trạng thái hình ảnh qua từng mức hư hại.
Đã kiểm tra Chrome headless với hai trang: vào cùng phòng, tên và số lượng người,
gửi thao tác di chuyển/bắn, cập nhật rời phòng, không có runtime exception.
Chưa đo FPS hay kết luận độ mượt trên mọi máy.

AI solo có đánh lái tránh vật cản đơn giản, chưa dùng NavMesh. Bản chơi dành cho máy
tính có chuột/bàn phím và WebGL. Đồ họa/âm thanh đều dựng bằng code.

## Bản vá phụ thuộc WebSocket

Đã nâng `ws` từ `8.18.3` lên `8.23.0` (cùng dòng 8.x) và cập nhật lockfile để xử
lý [GHSA-58qx-3vcg-4xpx](https://github.com/websockets/ws/security/advisories/GHSA-58qx-3vcg-4xpx)
và [GHSA-96hv-2xvq-fx4p](https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p).
Server giới hạn 128 fragments/buffered chunks cho mỗi kết nối; browser gửi thao tác
chơi bình thường không cần thay đổi. `npm audit` ngày 27/11/2026 trả về 0 lỗ hổng
đã biết trong cây phụ thuộc npm. Kết quả này không phải kiểm toán toàn bộ game.
Có kiểm tra hồi quy lý do đóng kết nối thông thường và từ chối frame bị chia nhỏ
quá mức. Các cảnh báo trên GitHub chỉ cập nhật sau khi bản vá được push và quét lại.

### Kỹ năng

- **1 — Tăng tốc:** tốc độ di chuyển tăng 60% trong 4 giây, hồi chiêu 12 giây kể từ lúc kích hoạt.
- **2 — Buff giáp:** giáp toàn thân giảm 90% sát thương từ mọi hướng trong 8 giây, hồi chiêu 18 giây kể từ lúc kích hoạt.
- Có thể bấm trực tiếp hai ô kỹ năng giữa HUD. Ô hiển thị thời gian còn lại, trạng thái đang dùng và vòng hồi chiêu sáng dần.
- Áp dụng cho solo và PvP; server kiểm soát kích hoạt, hiệu lực và hồi chiêu trong PvP. Tạm dừng solo dừng cả bộ đếm; PvP vẫn tiếp tục. Gió tăng tốc chỉ hiện khi xe di chuyển, theo hướng di chuyển thực tế. Khiên nhấp nháy trong 2 giây cuối. Hồi sinh hủy hiệu lực đang dùng và giữ thời gian hồi còn lại.
