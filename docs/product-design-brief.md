# Bản tóm tắt Thiết kế Sản phẩm (Product Design Brief - P4.1)
> **Dự án:** NihongoAI (Japanese Learning Desktop App)  
> **Tham chiếu đầu vào:** `docs/prd/product-requirements.md` (P3.1), `docs/prd/feature-specification.md` (P3.3)  
> **Trạng thái:** Đã phê duyệt (Approved Interaction Contract)

---

## 1. Bối cảnh & Xử lý Xung đột Mẫu (Context & Prompt Resolution)

Tài liệu này xác lập hợp đồng thiết kế trải nghiệm người dùng (UX/UI Interaction Contract) cho ứng dụng NihongoAI. 

### Quyết định giải quyết xung đột (Conflict Resolution):
Theo thứ tự ưu tiên của dự án, các khái niệm mang tính ví dụ trong khuôn mẫu bài tập mẫu (Kanban board: *Ticket, Four-status board, Login/Register, Direct drag*) được chuẩn hóa sang đúng miền nghiệp vụ thực tế của **NihongoAI**:
- **Khởi động phiên (Session Entry):** Thay thế màn hình Đăng nhập/Đăng ký bằng **Local-First Startup Handshake** (khởi động không cần tài khoản, tải dữ liệu cục bộ từ SQLite nhúng).
- **Hợp đồng trạng thái cốt lõi (Core Status Contract):** Thay thế 4 cột Kanban bằng **4 trạng thái đánh giá FSRS** (`Again`, `Hard`, `Good`, `Easy`) trong quy trình ôn tập thẻ lặp lại ngắt quãng.
- **Modal tạo/sửa tập trung (Centered Modal):** Áp dụng cho quá trình tạo và chỉnh sửa có cấu trúc Từ vựng, Ngữ pháp và Ghi chú học liệu.
- **Kéo thả / Di chuyển trực tiếp (Direct Movement):** Áp dụng cho việc sắp xếp thư mục Bộ thẻ (Deck reordering) và chuyển thẻ hàng loạt (Bulk move).

---

## 2. Nỗi đau Người dùng & Đánh đổi Trải nghiệm (User Struggle & Trade-offs)

### 2.1 Khảo sát Nỗi đau Người học Tiếng Nhật
1. **Học vẹt, thiếu khả năng phản xạ chủ động:** Người học flashcard truyền thống (như Anki) nhớ từ khi nhìn mặt chữ nhưng gặp khó khăn nghiêm trọng khi phải tự ghép từ thành câu hoàn chỉnh trong giao tiếp thực tế.
2. **Đứt mạch tập trung vì thao tác rườm rà (Flow state disruption):** Ôn tập flashcard đòi hỏi tốc độ cao. Nếu mỗi thẻ phải click chuột nhiều lần hoặc giao diện giật lag, người học sẽ nhanh chóng nản lòng.
3. **Phụ thuộc kết nối mạng & tài khoản phức tạp:** Người dùng chỉ muốn mở máy tính lên là học được ngay. Yêu cầu đăng nhập, xác thực email hay mất mạng làm gián đoạn việc học là rào cản tâm lý lớn.
4. **Hệ thống chấm điểm cứng nhắc:** Tiếng Nhật có nhiều cách biểu đạt đúng ngữ cảnh (trật tự từ linh hoạt, kính ngữ, thể thông thường). Các ứng dụng so khớp chuỗi tuyệt đối (*exact string match*) thường chấm sai oan và gây ức chế cho người học.

### 2.2 Đánh đổi Trải nghiệm (Experience Trade-offs)
- **Tốc độ > Chi tiết rườm rà (Màn hình Ôn tập):** Không bao giờ hiển thị popup xác nhận hay thông tin thứ cấp khi đang lật thẻ. Ưu tiên 100% điều khiển bằng bàn phím để người dùng hoàn thành 50-100 thẻ trong vài phút. Phân tích chi tiết chỉ hiển thị khi người học chủ động yêu cầu.
- **Local-First > Phụ thuộc Cloud:** Toàn bộ dữ liệu Flashcard, FSRS, Quản lý Deck/Từ vựng/Ngữ pháp và Luyện dịch Rule-based phải hoạt động tức thì khi không có Internet. AI là tầng giá trị gia tăng; nếu AI timeout hay mất mạng, ứng dụng vẫn hoạt động bình thường, không được phép crash hoặc chặn người dùng.

---

## 3. Hợp đồng Tương tác Cốt lõi (Core Interaction Contracts)

### 3.1 Khởi động Ứng dụng & Handshake Cục bộ (Session Entry Contract)
- **Không có Đăng nhập/Đăng ký:** Phần mềm desktop cá nhân, không có tài khoản cloud, không có mật khẩu.
- **Quy trình Handshake:**
  1. Cửa sổ Tauri mở ra $\rightarrow$ Hiển thị màn hình chờ (Splash Screen) với logo NihongoAI và thanh tiến trình nhẹ.
  2. Main process khởi động Spring Boot backend ngầm và liên tục kiểm tra tín hiệu qua endpoint `GET /api/ping`.
  3. Khi nhận HTTP 200 $\rightarrow$ Màn hình chờ mờ dần (Fade-out 300ms), hiển thị ngay Dashboard chính. Thời gian khởi động mục tiêu: $< 1.5$ giây.
  4. **Fallback khi lỗi khởi động:** Nếu sau 15 giây backend không phản hồi, hiển thị màn hình phục hồi (Recovery Screen) kèm nút "Thử khởi động lại" và "Xem nhật ký lỗi (Logs)".

### 3.2 Hợp đồng Ôn tập Thẻ FSRS (Review Interaction Contract)
- **Màn hình Focus Mode:** Khi bắt đầu phiên ôn, các thanh điều hướng xung quanh tự động ẩn hoặc làm mờ để tối ưu không gian hiển thị thẻ.
- **Quy tắc lật thẻ:**
  - **Mặt trước:** Hiển thị Từ/Kanji hoặc Nghĩa tiếng Việt. Nút hành động duy nhất: "Hiện đáp án" (`Space` hoặc `Enter`).
  - **Mặt sau:** Lật thẻ hiển thị Cách đọc (Furigana), Nghĩa, Ví dụ và 4 nút đánh giá tương ứng 4 trạng thái FSRS:
    - **1 - Again:** Quên hoàn toàn. Thẻ chuyển vào hàng đợi học lại trong ngày.
    - **2 - Hard:** Nhớ khó khăn. Giữ nguyên hoặc tăng nhẹ chu kỳ.
    - **3 - Good:** Nhớ bình thường (mặc định). Tăng chu kỳ tối ưu theo FSRS.
    - **4 - Easy:** Nhớ quá dễ dàng. Tăng vọt chu kỳ ôn tập.
  - Bên dưới mỗi nút luôn có **nhãn dự báo chu kỳ** (Badge preview: `10m`, `3d`, `1.5mo`) để người học biết trước thời gian thẻ sẽ quay lại.
- **Chuyển thẻ tự động (Auto-advance):** Bấm phím đánh giá $\rightarrow$ Thẻ tiếp theo xuất hiện ngay lập tức mà không có độ trễ hay bước xác nhận trung gian.
- **Hợp đồng Hoàn tác (Undo Contract):** Bấm `Ctrl + Z` khôi phục ngay lập tức thẻ vừa đánh giá nhầm, hoàn trả trạng thái FSRS trước đó và xóa bản ghi ReviewLog sai.

### 3.3 Hợp đồng Modal Tạo/Sửa Tri thức Tập trung (Centered Create/Edit Modal)
- **Cấu trúc & Bố cục:** Modal căn chính giữa màn hình, chiều rộng chuẩn 640px, lớp nền tối mờ (Backdrop Blur).
- **Hợp đồng Dữ liệu:**
  - **Từ vựng:** Ô nhập `Từ gốc` (bắt buộc), `Cách đọc` (Hiragana), `Nghĩa tiếng Việt` (bắt buộc), `Từ loại`, `Cấp độ JLPT`, `Ghi chú`.
  - **Ngữ pháp:** `Mẫu câu` (bắt buộc), `Nghĩa tiếng Việt` (bắt buộc), `Cấu trúc`, `Giải thích`, danh sách `Ví dụ` (hỗ trợ thêm/bớt nhiều dòng ví dụ độc lập).
- **Hợp đồng Bảo vệ Dữ liệu (Data Loss Prevention):**
  - Khi người dùng nhấn nút "Hủy", phím `Esc` hoặc bấm ra ngoài màn hình mờ khi form đã có nội dung: Bật hộp thoại cảnh báo: *"Dữ liệu chưa lưu sẽ bị mất. Bạn có chắc muốn thoát?"*.
  - Nếu việc lưu dữ liệu cục bộ thất bại (ví dụ: lỗi ghi SQLite): Giữ nguyên toàn bộ nội dung đã nhập trong form, hiển thị viền đỏ và thông báo lỗi rõ ràng, tuyệt đối không reset form.

### 3.4 Hợp đồng Luyện Dịch Câu & Đánh giá AI (Sentence Production Contract)
- **Đề bài & Nhập liệu:** Hiển thị câu tiếng Việt đề bài, danh sách từ vựng/ngữ pháp mục tiêu. Khung nhập liệu tiếng Nhật kích thước lớn, cỡ chữ $\ge 20\text{px}$.
- **Hợp đồng Bàn phím IME Tiếng Nhật:** Khi người dùng đang chọn chữ Hán trong bộ gõ IME (`e.nativeEvent.isComposing === true`), phím `Enter` chỉ dùng để xác nhận chữ Hán, không được kích hoạt nộp bài. Chỉ nhận lệnh nộp bài khi đã kết thúc phiên gõ IME.
- **Hợp đồng Kết quả Đa chiều:** Không dùng so khớp chuỗi tuyệt đối. Trả về thẻ kết quả gồm:
  - Điểm tổng quan (0–100) và 3 thanh điểm chi tiết: Ngữ nghĩa, Ngữ pháp, Độ tự nhiên.
  - Bảng lỗi chi tiết: Vị trí sai, lý do sai, cách sửa đúng bằng tiếng Việt.
  - Câu ví dụ gợi ý chuẩn mực (`suggestedAnswer`).

### 3.5 Hợp đồng Hội thoại Tình huống (Text Kaiwa Contract)
- **Giao diện Chat:** Dạng dòng thời gian đàm thoại (Conversation feed). Phân biệt rõ bong bóng chat của AI và của học viên.
- **Sửa lỗi không chặn mạch (Non-blocking Correction):** Phân tích ngữ pháp hiển thị dưới dạng icon hoặc accordion thu gọn ngay dưới câu của học viên, người học có thể bấm vào để xem hoặc tiếp tục gõ câu tiếp theo mà không bị ngắt quãng dòng trò chuyện.
- **Nút Gợi ý (Hint/Scaffolding):** Khi bí từ, học viên bấm "Gợi ý", hệ thống hiển thị 1-2 mẫu câu hoặc từ vựng hữu ích để tiếp tục đàm thoại.

---

## 4. Ma trận Trạng thái Thành phần Chi tiết ($frontend-expert)

Mọi thành phần giao diện phải được xây dựng tuân thủ đầy đủ 9 trạng thái sau:

| Trạng thái | Hành vi chi tiết & Quy chuẩn Giao diện |
| :--- | :--- |
| **Loading / Pending** | - **Dashboard/Thống kê:** Hiển thị Skeleton loading dạng nhịp đập nhẹ.<br>- **Đánh giá AI / Sinh bài tập:** Nút nộp đổi thành spinner kèm text *"AI đang phân tích..."*, giao diện không bị khóa (non-blocking), có nút *"Hủy"* nếu thời gian chờ quá 10 giây. |
| **Empty** | - **Bộ thẻ rỗng:** Hình minh họa mở hộp kèm nút kêu gọi *"Thêm ghi chú đầu tiên của bạn"*.<br>- **Hết lượt ôn trong ngày:** Hình ảnh hoàn thành mục tiêu kèm thông điệp chúc mừng và nút *"Xem trước thẻ ngày mai"*. |
| **Error** | - **Lỗi Validation:** Viền đỏ trường dữ liệu sai (`border: 2px solid var(--danger)`), hiển thị dòng hướng dẫn sửa lỗi ngay dưới ô nhập.<br>- **Lỗi AI / Mất mạng:** Hiển thị thông báo Toast cảnh báo mất kết nối, giữ nguyên nội dung bài làm trên màn hình và chuyển nút bấm thành *"Thử lại (Retry)"*. |
| **Disabled** | - Các nút hành động khi chưa thỏa mãn điều kiện (ví dụ: chưa nhập trường bắt buộc): Giảm độ mờ còn 40% (`opacity: 0.4`), con trỏ chuột dạng `not-allowed`, vô hiệu hóa sự kiện click và gắn thuộc tính `aria-disabled="true"`. |
| **Focus** | - Toàn bộ phần tử tương tác (nút, trường nhập, thẻ danh sách) phải có viền nét nổi bật khi duyệt bằng phím (`outline: 2px solid var(--accent); outline-offset: 2px`). Tuyệt đối không xóa bỏ outline mặc định mà không có viền thay thế. |
| **Keyboard** | - **Ôn tập thẻ:** Phím `Space`/`Enter` để lật thẻ; phím số `1`, `2`, `3`, `4` để chọn mức đánh giá; `Ctrl + Z` để hoàn tác thẻ trước.<br>- **Modal:** Phím `Esc` để đóng modal; phím `Tab` và `Shift + Tab` bị khóa (focus trap) bên trong modal. |
| **Touch / Pointer** | - Vùng tương tác tối thiểu (Hit Target) đạt $44 \times 44\text{px}$ cho tất cả các nút đánh giá, chuyển trang và thao tác lật thẻ trên màn hình cảm ứng Desktop / Trackpad. |
| **Narrow-view** | - Hỗ trợ độ phân giải cửa sổ tối thiểu: $1024 \times 768\text{px}$.<br>- Khi co nhỏ cửa sổ: Thanh điều hướng Sidebar tự động chuyển thành Icon Menu thu gọn; bảng danh sách từ vựng chuyển từ dạng Table sang dạng Card cuộn dọc. |
| **Reduced-motion** | - Khi hệ điều hành kích hoạt `prefers-reduced-motion: reduce`: Tắt hoàn toàn hiệu ứng lật thẻ 3D xoay vòng, chuyển sang hiệu ứng chuyển đổi tức thì (Instant switch); tắt các hiệu ứng nhịp đập của Skeleton loading. |

---

## 5. Danh mục Tính năng Bị loại trừ (Explicit Exclusions)

Để đảm bảo tính khả thi và giữ vững kiến trúc tinh gọn, các hạng mục sau **tuyệt đối không được thiết kế hoặc đưa vào component**:
1. **Không có Xác thực / Tài khoản:** Không thiết kế màn hình Login, Đăng ký, Quên mật khẩu, Xác thực 2 bước (2FA), SSO hay Đăng nhập qua mạng xã hội.
2. **Không có Đồng bộ Đám mây (Cloud Sync):** Không thiết kế giao diện đồng bộ online, không lưu dữ liệu người dùng ra server đám mây.
3. **Không có Phiên bản Web/Mobile:** Không thiết kế bố cục cho màn hình điện thoại di động dọc (mobile portrait); tập trung 100% cho trải nghiệm ứng dụng máy tính (Desktop App qua Tauri).
4. **Không tích hợp Từ điển trực tuyến:** Không thiết kế các popup tra cứu từ điển bên ngoài trong giai đoạn này.

---

## 6. Tiêu chí Nghiệm thu & Chuyển giao Thiết kế (Acceptance Gate)

Một bản thiết kế Visual / Mockup hoặc Prototype được coi là đạt chuẩn khi:
- [x] Khởi đầu từ luồng công việc thực tế của người học, không bắt đầu từ việc trang trí màu sắc.
- [x] Các trạng thái chính (Success), lỗi (Failure) và phục hồi (Recovery) được mô tả cụ thể, có thể quan sát và kiểm thử được.
- [x] Quy chuẩn điều khiển bàn phím (Keyboard shortcuts) và xử lý IME tiếng Nhật được phản ánh rõ ràng trong tương tác mẫu.
- [x] Toàn bộ danh mục loại trừ (Exclusions) khớp chính xác với tài liệu PRD.
