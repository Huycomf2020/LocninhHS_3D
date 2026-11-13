# THPT Lộc Ninh · Virtual Campus 3D

Bản demo tham quan khuôn viên chạy trên trình duyệt với React, Vite, React Three Fiber và Three.js.

## Chạy dự án

Cần Node.js 22 trở lên. Mở terminal tại thư mục chứa `package.json`.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in ra, thường là `http://localhost:5173`. Để thử trên điện thoại cùng mạng Wi-Fi, chạy `npm run dev -- --host 0.0.0.0` và mở địa chỉ **Network** Vite hiển thị. Trình duyệt cần hỗ trợ WebGL 2.

```sh
npm run build
npm run preview
```

Bản build nằm trong `dist/`. Có thể đưa thư mục này lên máy chủ web tĩnh.

## Thao tác

- Di chuyển bằng WASD, phím mũi tên hoặc kéo joystick. Giữ Shift để chạy.
- Kéo trên cảnh để xoay camera. Trên máy tính có thể nhấp đúp để khóa chuột, rồi nhấn Esc để thoát.
- Nhấn V hoặc chọn nút TPS / FPS. Nút tâm ngắm đưa nhân vật về điểm xuất phát.
- Nhấn M hoặc chạm sơ đồ nhỏ để mở bản đồ toàn trường. Chọn điểm để đọc mô tả và dùng **Đến vị trí** để di chuyển tới đó.
- Nhấn E khi tới gần điểm hoặc chạm dấu vàng để xem thông tin. Bộ đếm khám phá theo dõi các điểm đã mở trong phiên hiện tại.

## Cấu trúc

- `src/campus.js` chứa tọa độ, dấu mốc và các khối va chạm. Cảnh 3D và bản đồ dùng chung tọa độ dãy nhà và điểm tham quan.
- `src/Scene.jsx` dựng mô hình, ánh sáng, nhân vật, camera và chuyển động. Va chạm 2D với dãy nhà, bệ cờ, cột mái che và ranh giới giữ nhân vật trong khu vực tham quan.
- `src/main.jsx` quản lý thao tác chuột, bàn phím, cảm ứng, HUD, bản đồ và hộp thông tin.
- `src/style.css` định nghĩa giao diện desktop và mobile.

## Phạm vi mô phỏng

Mặt bằng phối hợp ảnh vệ tinh, sơ đồ trường và hai ảnh chụp thực tế. Sơ đồ xác nhận hai dãy bên có tầng trệt, lầu 1 và lầu 2, nhà hiệu bộ và phòng chức năng nằm ngang cuối sân, với sân khấu ở phía trước. Ảnh chụp dùng để dựng cổng mái ngói có bảng xanh, chốt bảo vệ bên trái, lối vào có hàng cau và cờ dây, cùng các nhịp mái vòm. Ảnh vệ tinh bổ sung sân thể thao và các khối bên phải; sơ đồ cung cấp vị trí tương đối của khu để xe và cổng phụ. Khuôn viên, minimap và bản đồ toàn trường dùng chung các mốc chính.

Tỷ lệ, cao độ, kích thước, vật liệu, số nhịp mái vòm, hình khối phụ, mặt đứng nhà hiệu bộ và bố trí cây là mô phỏng. A/C là ký hiệu điều hướng của demo. Bản demo tham quan ngoài trời.

Khu vực cổng dựng theo ảnh mặt ngoài và mặt trong. Hai bảng cổng vẽ lại cho rõ nét; banner giữ ảnh cũ và đổi màu nền. Dòng “Mỗi ngày Trường tốt lên 0,1%” được đưa vào chất liệu đá. Phòng bảo vệ có cửa hé mở và nhân vật bảo vệ; biển nền xanh chỉ về hầm xe giáo viên. Vị trí và kích thước tiểu cảnh được ước lượng.

## Nhân vật

Mở nút Nhân vật để xem, xoay và chọn một trong bốn mẫu. Hai nhân vật nữ cao 1,55 m, hai nhân vật nam cao 1,70 m. Học sinh mang logo THPT Lộc Ninh do người dùng cung cấp trên tay trái. Các mẫu 3D cách điệu có chuyển động tay, chân và tà áo khi đi; góc nhìn FPS theo chiều cao nhân vật.

Cổng nối với sân bằng dốc mô phỏng chênh cao 0,84 m, có hai hàng cau và cỏ hai bên. Bầu trời quang, mây và ánh sáng mô phỏng theo đồng hồ múi giờ Việt Nam, không lấy dữ liệu thời tiết trực tiếp.

Cổng phụ bên phải nối đường bên hông với khu để xe học sinh. Qua đường, Cà phê Xanh có bàn cờ tướng với hai người chơi và hai người xem. Có thể chọn hai địa điểm trên bản đồ.

Cổng phụ đối diện giữa dãy C. Nhìn từ đường vào, nhà xe ở bên phải và nhà đa năng ở bên trái, trên phần đất mở rộng trong hàng rào. Có lối xi măng vòng về cổng chính. Tại Cà phê Xanh, nhấn E khi đến gần để gọi món mô phỏng.

Cà phê Xanh nằm đối diện nhà đa năng. Nút loa bật/tắt tiếng bước chân và âm thanh quán. Giọng nói tiếng Việt tổng hợp phát cục bộ, với âm lượng thay đổi theo khoảng cách.
