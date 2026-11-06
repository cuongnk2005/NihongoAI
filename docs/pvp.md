# Đấu trường từ vựng: PvP và Quiz nhiều người

## Quiz nhiều người

1. Trong **Đấu PvP**, nhập tên, chọn một trong 12 icon và chọn **Quiz nhiều người**.
2. Host chọn **Bộ thẻ làm câu hỏi** từ bộ thẻ local, số câu và thời gian mỗi câu (15, 20, 30 hoặc 60 giây), rồi tạo phòng. Bộ cha bao gồm thẻ trong bộ con; chỉ gửi từ, cách đọc và nghĩa Việt, không gửi lịch sử học. Cần 5–5.000 thẻ có từ và nghĩa; thẻ cloze bị bỏ qua. Câu hỏi không lấy thêm từ bên ngoài bộ đã chọn.
3. Tối đa 50 người khác nhập tên, chọn icon và mã phòng. Host vừa điều khiển vừa trả lời, nhận điểm và xuất hiện trong bảng xếp hạng như mọi người (tổng tối đa 51 người gồm host).
4. Host bắt đầu khi có ít nhất một người chơi. Phòng khóa người mới khi bắt đầu.
5. Cả phòng nhận cùng câu hỏi và thứ tự 4 đáp án. Mỗi người được trả lời một lần. Điểm và thời gian của lượt hiện tại chỉ công bố khi mọi người đã trả lời, hết giờ hoặc host chủ động kết thúc câu.
6. Sau đáp án, trò chơi tự chuyển câu sau 3 giây (lượt cuối chuyển đến kết quả). Trong thời gian công bố đáp án, host có thể bấm **Xem bảng xếp hạng** để tạm dừng tự chuyển và mở bảng điểm cho cả phòng. Host bấm **Câu tiếp theo** để tiếp tục, hoặc **Kết thúc & vinh danh** ở lượt cuối. Khách không có quyền chuyển câu.
7. Icon xếp hàng ngang từ trái sang phải theo tổng điểm giảm dần, có hiệu ứng đổi vị trí. Sau mỗi câu hiển thị thêm điểm nhận được và thời gian trả lời; không trả lời nhận 0 điểm. Bằng điểm thì đồng hạng, thứ tự hiển thị ổn định theo lúc vào phòng.

## Nhập bộ đề CSV có đáp án

Trong phần tạo phòng, chọn **Nguồn câu hỏi → Bộ đề CSV đã nhập → Nhập CSV**. File UTF-8 tối đa 2 MB, 1–500 câu, có các cột (có thể đổi thứ tự):

```csv
number,section,question,option_a,option_b,option_c,option_d,correct_answer
1,Kanji Reading,彼は ダンスが【得意】だ。,どおくい,とおくい,どくい,とくい,D
```

CSV/TSV, dấu ngoặc kép bao ô có dấu phẩy, dấu ngoặc kép thoát và ô nhiều dòng đều được hỗ trợ. `correct_answer` là A/B/C/D. Đây là nhập dữ liệu có sẵn đáp án, không dùng AI để giải đề. Chưa hỗ trợ Word/PDF/OCR.

Màn xem trước hiển thị số câu hợp lệ và số câu cần sửa. Chọn câu ở cột trái để sửa số câu, nhóm, nội dung, 4 lựa chọn và đáp án đúng. Không được lưu nếu còn lỗi hoặc trùng số câu/lựa chọn. Lưu thành công mới đóng hộp thoại; lỗi lưu giữ nguyên nội dung đang sửa. Bộ đề nằm trong IndexedDB riêng của trình duyệt cùng domain, tách khỏi bộ thẻ từ vựng. **Xem / sửa** cập nhật bộ đề; **Xuất CSV** tạo bản sao lưu có thể nhập lại.

Host chọn bộ đề, nhóm (hoặc tất cả), số câu (hoặc toàn bộ) và có thể xáo trộn câu hỏi. Thứ tự A–D giữ nguyên. Câu hỏi và đáp án được chụp tại lúc tạo phòng, chỉnh bộ đề sau đó không làm thay đổi trận đã tạo. Phần trong `【…】` được tô nổi bật khi chơi. Máy chủ kiểm tra lại dữ liệu và giữ đáp án đúng kín đến lúc công bố; bộ đề không được lưu vào kho từ vựng chung.

Kiểm thử parser: `cd app` rồi `npm run test:quiz-import`.

Màn chơi dùng bố cục gọn theo chiều cao cửa sổ: câu hỏi và bốn đáp án cùng hiện, không đặt bảng xếp hạng lớn phía trên. Bảng điểm đầy đủ chỉ mở khi host yêu cầu hoặc trận kết thúc; danh sách dài cuộn bên trong bảng.

Host có thể tải lại cùng tab để tiếp tục điều khiển. Khi host rời màn hình, trò chơi vẫn tự chuyển câu qua các lần lấy trạng thái của người còn lại, nhưng nếu đang mở bảng xếp hạng thì cần host quay lại để tiếp tục; chưa có chuyển quyền host. Chưa hỗ trợ kick, tái đấu trong cùng phòng, nhạc, power-up hoặc chống gian lận bằng tài khoản.

Trong bản triển khai Render/Vercel, tất cả dùng chung API HTTPS của Render được cấu hình bằng `VITE_API_URL`. Host gửi bản chụp bộ thẻ được chọn để tạo câu hỏi; không ghi bộ thẻ này vào kho từ chung hay thay đổi bộ gốc trong IndexedDB. Người chơi khác không cần import bộ thẻ. Trạng thái phòng nằm trong RAM: chỉ chạy một instance và các phòng mất sau restart/deploy.

## Thử trên một máy

1. Chạy backend và frontend như bình thường. Tạo/import bộ thẻ local có ít nhất 5 từ và 4 nghĩa khác nhau.
2. Mở ứng dụng trong hai tab trình duyệt độc lập và chọn **Đấu PvP**.
3. Tab thứ nhất nhập tên, chọn **Đối kháng 1–1**, số câu và **Tạo phòng**.
4. Tab thứ hai nhập tên khác, cùng địa chỉ API (mặc định `http://localhost:8088/api`), mã phòng rồi **Vào phòng**.
5. Chủ phòng nhấn **Bắt đầu trận đấu**. Mỗi người chọn một đáp án mỗi câu.

## Hai máy

Chạy backend trên máy chủ phòng. Cả hai ứng dụng nhập địa chỉ API truy cập được của máy này, ví dụ `http://192.168.1.10:8088/api`. Cần cấu hình mạng/tường lửa cho cổng backend. Chạy frontend trên localhost của từng máy để phù hợp cấu hình CORS hiện tại. Không dùng `localhost` làm địa chỉ máy chủ trên máy của khách.

Bộ thẻ nguồn thuộc trình duyệt host, được gửi đến backend chung khi tạo phòng. Bản hiện tại chưa có tài khoản; API quản lý kho từ backend chưa được xác thực.

## Luật chơi

- Chọn ngẫu nhiên 5–20 câu (giới hạn theo số từ đủ điều kiện), không lặp từ nguồn. Xáo trộn luân phiên các dạng đủ điều kiện: Nhật → nghĩa Việt, nghĩa Việt → từ Nhật, Kanji → cách đọc Hiragana. Mỗi câu có 4 đáp án khác nhau.
- Dạng Kanji → Hiragana chỉ dùng từ chứa Kanji và cách đọc thuần Hiragana (cho phép dấu kéo dài `ー`). Cần ít nhất 4 cách đọc khác nhau; thiếu dữ liệu thì bỏ qua dạng này. Không tự đoán cách đọc.
- Những câu có cùng nội dung hỏi nhưng nhiều đáp án đúng trong kho bị loại ở dạng tương ứng, ví dụ cùng nghĩa Việt có nhiều từ Nhật. Cả hai người luôn nhận cùng dạng, câu hỏi và thứ tự lựa chọn.
- Mỗi câu có thời gian theo cấu hình host. Đúng: `500 + floor(500 × thời gian còn lại / thời gian mỗi câu)`; sai hoặc hết giờ: 0 điểm.
- Máy chủ tính thời gian và điểm lúc nhận đáp án. Độ trễ mạng có ảnh hưởng đến điểm tốc độ.
- Cả hai được trả lời độc lập; trả lời trước không khóa lượt của đối thủ.
- Khi cả hai đã trả lời hoặc hết giờ, hiện đáp án và điểm trong 3 giây rồi chuyển câu. Tổng điểm cao hơn thắng; bằng điểm là hòa.
- Đáp án và điểm câu hiện tại được giữ kín đến lúc công bố. Token phiên riêng kiểm soát quyền bắt đầu/trả lời.
- Giao diện lấy trạng thái mỗi 500 ms và tự kết nối lại. Tải lại cùng tab giữ phiên; **Rời màn hình** bỏ phiên trên tab, không giải phóng chỗ trong phòng. Người còn lại có thể hoàn thành trận qua thời hạn mỗi câu.
- Phòng lưu trong RAM, hết hạn sau 1 giờ không truy cập; khởi động lại backend sẽ mất phòng. Chưa có lưu lịch sử, chơi lại trong cùng phòng, xử thua do thoát hoặc ghép trận công khai.

## API

`POST /api/pvp/rooms` với `{name, count, mode, avatar, seconds}` trả `{token, room}`. `mode` là `DUEL` (mặc định, tương thích bản cũ) hoặc `QUIZ`; `avatar` là ID icon hợp lệ; `seconds` mặc định 15.

Nguồn bộ thẻ: thêm `source: {name, cards: [{word, reading, meaningVi}]}`. Nguồn bộ đề: thêm `exam: {name, shuffle, questions: [{number, section, question, options: [A, B, C, D], correct}]}`; `correct` là chỉ số 0–3. Chỉ chọn một nguồn. Bộ đề cho phép 1–500 câu mỗi trận, bộ thẻ vẫn 5–20 câu.

`POST /api/pvp/rooms/{code}/join` với `{name, avatar}` trả phiên khách. Các ID icon: `fox`, `cat`, `panda`, `rabbit`, `frog`, `tiger`, `bear`, `penguin`, `owl`, `dragon`, `dog`, `koala`.

Các lệnh sau yêu cầu header `X-Player-Token`:

- `GET /api/pvp/rooms/{code}`: trạng thái theo góc nhìn người chơi.
- `POST /api/pvp/rooms/{code}/start` với `{}`: chỉ chủ phòng, đủ hai người.
- `POST /api/pvp/rooms/{code}/answers` với `{round, choice}`: lựa chọn 0–3, mỗi câu một lần.
- `POST /api/pvp/rooms/{code}/next` với `{round, phase}`: chỉ host Quiz, chuyển `PLAYING → REVEAL → RANKING → PLAYING` (hoặc `FINISHED` khi hết câu). Kiểm tra round và phase để chặn gửi lặp làm bỏ qua lượt.
