# PvP từ vựng (bản đầu)

## Thử trên một máy

1. Chạy backend và frontend như bình thường. Kho từ vựng backend cần ít nhất 5 từ có 4 nghĩa khác nhau.
2. Mở ứng dụng trong hai tab trình duyệt độc lập và chọn **Đấu PvP**.
3. Tab thứ nhất nhập tên, chọn số câu và **Tạo phòng**.
4. Tab thứ hai nhập tên khác, cùng địa chỉ API (mặc định `http://localhost:8088/api`), mã phòng rồi **Vào phòng**.
5. Chủ phòng nhấn **Bắt đầu trận đấu**. Mỗi người chọn một đáp án mỗi câu.

## Hai máy

Chạy backend trên máy chủ phòng. Cả hai ứng dụng nhập địa chỉ API truy cập được của máy này, ví dụ `http://192.168.1.10:8088/api`. Cần cấu hình mạng/tường lửa cho cổng backend. Chạy frontend trên localhost của từng máy để phù hợp cấu hình CORS hiện tại. Không dùng `localhost` làm địa chỉ máy chủ trên máy của khách.

Kho từ thuộc backend đang kết nối; bản hiện tại chưa có tài khoản. Chỉ dùng máy chủ của người mời để câu hỏi lấy từ đúng kho của họ. Không triển khai backend cá nhân trực tiếp lên Internet vì API từ vựng hiện tại chưa có xác thực. PvP qua Internet cần một máy chủ phòng riêng và cơ chế tải bộ câu hỏi của chủ phòng có xác thực.

## Luật chơi

- Chọn ngẫu nhiên 5–20 câu (giới hạn theo số từ đủ điều kiện), không lặp từ nguồn. Xáo trộn luân phiên các dạng đủ điều kiện: Nhật → nghĩa Việt, nghĩa Việt → từ Nhật, Kanji → cách đọc Hiragana. Mỗi câu có 4 đáp án khác nhau.
- Dạng Kanji → Hiragana chỉ dùng từ chứa Kanji và cách đọc thuần Hiragana (cho phép dấu kéo dài `ー`). Cần ít nhất 4 cách đọc khác nhau; thiếu dữ liệu thì bỏ qua dạng này. Không tự đoán cách đọc.
- Những câu có cùng nội dung hỏi nhưng nhiều đáp án đúng trong kho bị loại ở dạng tương ứng, ví dụ cùng nghĩa Việt có nhiều từ Nhật. Cả hai người luôn nhận cùng dạng, câu hỏi và thứ tự lựa chọn.
- Mỗi câu 15 giây. Đúng: `500 + floor(500 × thời gian còn lại / 15 giây)`; sai hoặc hết giờ: 0 điểm.
- Máy chủ tính thời gian và điểm lúc nhận đáp án. Độ trễ mạng có ảnh hưởng đến điểm tốc độ.
- Cả hai được trả lời độc lập; trả lời trước không khóa lượt của đối thủ.
- Khi cả hai đã trả lời hoặc hết giờ, hiện đáp án và điểm trong 3 giây rồi chuyển câu. Tổng điểm cao hơn thắng; bằng điểm là hòa.
- Đáp án và điểm câu hiện tại được giữ kín đến lúc công bố. Token phiên riêng kiểm soát quyền bắt đầu/trả lời.
- Giao diện lấy trạng thái mỗi 500 ms và tự kết nối lại. Tải lại cùng tab giữ phiên; **Rời màn hình** bỏ phiên trên tab, không giải phóng chỗ trong phòng. Người còn lại có thể hoàn thành trận qua thời hạn mỗi câu.
- Phòng lưu trong RAM, hết hạn sau 1 giờ không truy cập; khởi động lại backend sẽ mất phòng. Chưa có lưu lịch sử, chơi lại trong cùng phòng, xử thua do thoát hoặc ghép trận công khai.

## API

`POST /api/pvp/rooms` với `{name, count}` trả `{token, room}`.

`POST /api/pvp/rooms/{code}/join` với `{name}` trả phiên khách.

Các lệnh sau yêu cầu header `X-Player-Token`:

- `GET /api/pvp/rooms/{code}`: trạng thái theo góc nhìn người chơi.
- `POST /api/pvp/rooms/{code}/start` với `{}`: chỉ chủ phòng, đủ hai người.
- `POST /api/pvp/rooms/{code}/answers` với `{round, choice}`: lựa chọn 0–3, mỗi câu một lần.
