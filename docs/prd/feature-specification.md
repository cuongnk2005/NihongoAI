# Đặc tả Hành vi & Chức năng (Feature Specification - P3.3)
> **Dự án:** NihongoAI (Japanese Learning Desktop App)  
> **Tham chiếu:** `product-requirements.md`

Tài liệu này đặc tả chi tiết hành vi hệ thống (System & User Behaviors) cho 8 nhóm chức năng cốt lõi. Tài liệu hoàn toàn độc lập với các quyết định về mặt thiết kế kỹ thuật (Database schema, Code, API architecture), nhằm phục vụ trực tiếp cho quá trình thiết kế UI/UX và phát triển luồng logic.

---

## Feature 1: Quản lý Tri thức Từ vựng & Ngữ pháp (FR-01)
Tính năng cho phép người dùng xem, thêm, sửa, xóa (CRUD) các mục Từ vựng và Ngữ pháp độc lập với Thẻ ghi nhớ.

* **Success flow:** Người dùng mở danh sách Từ vựng/Ngữ pháp -> Nhấn "Thêm mới" -> Điền các trường thông tin (Word, Reading, Meaning, Level...) -> Nhấn "Lưu". Hệ thống đóng form, hiển thị mục vừa thêm lên đầu danh sách và thông báo thành công.
* **Validation behavior:** Các trường "Từ gốc" và "Nghĩa tiếng Việt" là bắt buộc. Nếu bỏ trống, nút "Lưu" vẫn bấm được nhưng hệ thống sẽ hiển thị viền đỏ cảnh báo tại trường bị thiếu và chặn không cho lưu.
* **Failure & Recovery behavior:** Nếu việc lưu dữ liệu cục bộ thất bại (ví dụ: lỗi đọc/ghi đĩa), hệ thống giữ nguyên form nhập liệu, hiển thị cảnh báo "Lưu thất bại" và cho phép người dùng thử lại (Retry) mà không mất nội dung đã gõ.
* **Persistence & Access behavior:** Dữ liệu được lưu trữ vĩnh viễn vào ổ cứng cục bộ ngay khi bấm lưu.
* **Empty state:** Khi chưa có từ vựng/ngữ pháp nào, giao diện danh sách hiển thị một minh họa (illustration) thân thiện kèm nút "Thêm từ vựng đầu tiên của bạn".
* **User observable interactions:** 
  - Khi xóa một từ vựng, hệ thống bật popup xác nhận: "Bạn có chắc muốn xóa? Các thẻ đang liên kết với từ này sẽ mất dữ liệu hiển thị gốc."

---

## Feature 2: Quản lý Bộ thẻ & Thẻ học (FR-02)
Tính năng tổ chức học liệu thành các thư mục (Deck) và sinh thẻ (Card) từ Ghi chú gốc (Note).

* **Success flow:** Người dùng mở một Deck -> Nhấn "Tạo Ghi chú" -> Nhập nội dung (hoặc liên kết tới Từ vựng có sẵn) -> Chọn kiểu sinh thẻ (Ví dụ: 2 chiều) -> Lưu. Hệ thống tự động tách ra 2 thẻ độc lập vào trong Deck đó.
* **Validation behavior:** Tên Deck không được phép trùng lặp trong cùng một thư mục cha. Nếu trùng, thông báo "Tên bộ thẻ đã tồn tại" xuất hiện ngay cạnh ô nhập liệu.
* **Failure & Recovery behavior:** Nếu cố gắng tạo Note mà chưa có Deck nào, hệ thống yêu cầu tạo Deck trước. Khi xóa một Deck, nếu xảy ra lỗi hệ thống, giao diện báo lỗi và phục hồi lại trạng thái hiển thị của Deck đó.
* **Persistence behavior:** Xóa một Deck sẽ xóa toàn bộ Note và Card bên trong nó. Thao tác này yêu cầu gõ lại chính xác tên Deck để xác nhận (Hard Confirm) nhằm tránh xóa nhầm.
* **Empty state:** Màn hình quản lý Card hiển thị trạng thái rỗng nếu Deck chưa có Note nào.
* **User observable interactions:** 
  - Kéo thả (Drag & Drop) để thay đổi vị trí của các Deck (Tạo deck con).
  - Có thể chọn nhiều Note/Card cùng lúc để đổi Deck (Bulk Move).

---

## Feature 3: Ôn tập FSRS & Hàng đợi Hàng ngày (FR-03)
Tính năng cốt lõi phục vụ việc học lặp lại ngắt quãng.

* **Success flow (Bắt đầu ôn):** Người dùng nhìn thấy số lượng thẻ "Cần ôn hôm nay (Due)" và "Thẻ mới (New)" trên màn hình chính -> Nhấn "Bắt đầu". Giao diện chuyển sang chế độ tập trung (Focus mode), hiển thị mặt trước của thẻ đầu tiên trong hàng đợi (Queue).
* **Success flow (Đánh giá thẻ):** Người dùng lật thẻ (qua UI button hoặc keyboard shortcut) -> Xem mặt sau -> Chọn 1 trong 4 mức độ đánh giá (Again, Hard, Good, Easy). Ngay sau khi đánh giá, hệ thống tự động chuyển sang thẻ tiếp theo mà không yêu cầu thao tác bổ sung.
* **Loading/pending state:** Nếu việc tính toán FSRS hoặc nạp thẻ mới cần thời gian, giao diện sẽ hiển thị trạng thái chờ (loading indicator) phù hợp để người dùng biết hệ thống đang xử lý.
* **Persistence & Recovery behavior:** Nhật ký đánh giá được lưu cục bộ ngay lập tức. Nếu tắt ứng dụng giữa phiên ôn tập, lần mở tiếp theo hệ thống sẽ nạp lại đúng hàng đợi còn dang dở.
* **Empty state:** Khi đã ôn hết số lượng thẻ trong ngày, giao diện hiển thị thông báo chúc mừng "Bạn đã hoàn thành mục tiêu hôm nay!".
* **User observable interactions:** 
  - Bên dưới mỗi nút đánh giá (Again, Hard, Good, Easy) luôn hiển thị dự báo khoảng thời gian thẻ sẽ quay lại (Ví dụ: `10m`, `3d`, `1.5mo`).
  - Giao diện có thanh tiến trình (Progress bar) thể hiện tỷ lệ thẻ đã ôn trên tổng số thẻ của phiên.

---

## Feature 4: Nhập/Xuất Dữ liệu CSV/TSV (FR-04)
Tính năng trao đổi dữ liệu với bên ngoài để hỗ trợ tương thích với Anki.

* **Success flow (Import):** Chọn "Nhập dữ liệu" -> Tải file `.csv`/`.tsv` lên -> Màn hình hiển thị bảng Mapping -> Chọn ánh xạ cột -> Nhấn "Bắt đầu nhập" -> Hiển thị kết quả thành công.
* **Success flow (Export):** Chọn "Xuất dữ liệu" -> Chọn phạm vi/Deck cần xuất -> Chọn định dạng (CSV/TSV) -> Hệ thống tạo file và lưu xuống máy tính. File export giữ đúng các trường dữ liệu và có thể Import ngược lại mà không mất mát thông tin.
* **Validation behavior:** Nếu file Import không đúng định dạng hoặc rỗng, chặn ngay lập tức. Với Export, nếu Deck trống, hệ thống không cho phép xuất và hiển thị thông báo.
* **Failure & Recovery behavior:** 
  - *Import:* Nếu lỗi giữa chừng, hệ thống hoàn tác (rollback) toàn bộ, báo lỗi dòng X và không làm hỏng dữ liệu hiện tại.
  - *Export:* Nếu lỗi ghi file (thiếu quyền, đầy bộ nhớ), hệ thống báo lỗi rõ ràng và giữ nguyên trạng thái ứng dụng, không crash.
* **User observable interactions:** 
  - Xem trước (Preview) 5 dòng đầu khi Import để kiểm tra lỗi font chữ.

---

## Feature 5: Luyện dịch câu cốt lõi (FR-05)
Tính năng kết hợp Rule-based offline và AI-generated để kiểm tra khả năng ghép câu.

* **Success flow (Rule-based Offline):** Hệ thống tự động trích xuất các "Câu ví dụ" có sẵn trong cơ sở dữ liệu Từ vựng/Ngữ pháp để tạo thành bài tập dịch câu Việt -> Nhật. Khi người dùng nộp câu dịch tiếng Nhật, hệ thống đối chiếu và chấm điểm tức thì.
* **Success flow (AI-generated Online):** Dựa vào Từ vựng/Ngữ pháp mục tiêu, AI sinh một câu tiếng Việt -> Người dùng nhập câu dịch tiếng Nhật -> Nộp bài -> AI đánh giá dựa trên nhiều yếu tố (Ngữ nghĩa, Ngữ pháp, Tự nhiên) thay vì chỉ so khớp chuỗi chính xác (exact string matching), sau đó giải thích lỗi sai.
* **Loading/pending state:** Khi chờ AI sinh đề hoặc chấm điểm, nút bấm hiển thị trạng thái xoay vòng (Spinner) với chữ "AI đang suy nghĩ...". Giao diện không bị khóa (non-blocking), người dùng vẫn có thể bấm "Hủy" để quay lại.
* **Failure & Recovery behavior (AI Error):** Nếu mất kết nối Internet hoặc AI phản hồi quá lâu (Timeout), hiển thị cảnh báo lỗi mạng. Nội dung người dùng vừa gõ được giữ nguyên trên màn hình, nút "Nộp bài" đổi thành "Thử lại".
* **Persistence behavior:** Mọi kết quả bài làm (đề bài, câu trả lời, nhận xét của AI) đều được lưu vào Lịch sử Luyện tập (Practice History).
* **Empty state:** Nếu người dùng chọn luyện Rule-based nhưng thư viện Từ vựng/Ngữ pháp chưa có "Ví dụ" nào, hệ thống hiển thị thông báo: "Chưa có đủ dữ liệu ví dụ để tạo bài tập. Hãy quay lại học thêm từ vựng mới!".
* **User observable interactions:** 
  - Trên màn hình Lịch sử Luyện tập, người dùng có thể nhấp vào một bài cũ để xem lại toàn bộ phần giải thích lỗi sai của AI như lúc mới làm xong.

---

## Feature 6: Hội thoại Tình huống (Text Kaiwa) (FR-06)
Môi trường chat mô phỏng thực tế với mức độ khó được kiểm soát.

* **Success flow:** Người dùng chọn chủ đề (VD: Đi ăn nhà hàng) và cấp độ (VD: N4) -> Nhấn "Bắt đầu hội thoại". AI gửi tin nhắn mở màn tiếng Nhật. Người dùng gõ câu trả lời, AI tiếp tục phản hồi.
* **Validation behavior:** Người dùng không thể gửi tin nhắn rỗng hoặc tin nhắn chỉ chứa khoảng trắng.
* **Failure & Recovery behavior:** Nếu mất mạng khi đang gửi tin nhắn chat hoặc khi yêu cầu "Phân tích câu", hệ thống giữ nguyên nội dung gõ, hiện cảnh báo lỗi mạng (hoặc icon dấu chấm than `!`) và cung cấp nút `Retry` để thử lại khi có mạng.
* **Persistence behavior:** Cuộc hội thoại được lưu lại vĩnh viễn trong cơ sở dữ liệu cục bộ. Người dùng có thể xem lại lịch sử các đoạn chat cũ.
* **User observable interactions:** 
  - "Phân tích câu" (Grammar Analysis): Người dùng có thể yêu cầu AI phân tích một câu tiếng Nhật vừa gửi. AI sẽ chỉ ra lỗi ngữ pháp và giải thích ở một khu vực riêng (hoặc popup) mà hoàn toàn không làm gián đoạn trạng thái hay mạch của cuộc hội thoại hiện tại.

---

## Feature 7: Thống kê học tập (FR-07)
Màn hình Dashboard báo cáo dữ liệu học tập cá nhân.

* **Loading/pending state:** Các biểu đồ và con số thống kê tải bất đồng bộ (Asynchronous). Nếu lượng dữ liệu lớn, khu vực biểu đồ hiển thị hiệu ứng khung xương (Skeleton loading) trước khi hiện hình.
* **Persistence behavior:** Toàn bộ dữ liệu tổng hợp được tính toán từ CSDL cục bộ (Review History, Practice History), luôn chính xác ngay cả khi ngắt mạng.
* **Empty state:** Với người dùng mới hoặc những ngày không có hoạt động học tập, biểu đồ Heatmap sẽ thể hiện trạng thái 0 (ví dụ: màu xám nhạt) thay vì coi đó là lỗi.
* **User observable interactions:** 
  - Rê chuột (Hover) lên một ô vuông trên Heatmap sẽ hiển thị chính xác ngày và số lượng hoạt động học tương ứng trong ngày hôm đó.

---

## Feature 8: Trải nghiệm Nâng cao (STT/TTS & APKG) (FR-08)
Bổ trợ khả năng tương tác bằng giọng nói và tương thích ngược với hệ sinh thái Anki.

* **Success flow (STT/TTS):** 
  - *Đọc văn bản:* Bấm biểu tượng "Loa" trên Flashcard, hệ thống phát âm tiếng Nhật.
  - *Nhận diện giọng nói:* Nhấn biểu tượng "Micro" ở khung nhập liệu -> Trạng thái đổi sang "Đang nghe..." -> Người dùng nói -> Chữ tiếng Nhật xuất hiện trong khung text.
* **Offline & Recovery behavior (STT/TTS):** 
  - Tính năng STT/TTS ưu tiên khả năng hoạt động offline. 
  - Nếu thiết bị không hỗ trợ tính năng này offline, hệ thống phải thông báo rõ ràng cho người dùng rằng tính năng này cần kết nối Internet (Không được âm thầm chuyển sang xử lý online mà không báo trước).
  - Khi không có Internet và không thể xử lý offline, thao tác phải thất bại an toàn: hiện thông báo lỗi, không làm crash ứng dụng và tuyệt đối không làm mất nội dung đang nhập dở của người dùng.
* **Success flow (APKG Import & Export):** 
  - *Import:* Tải lên file `.apkg` -> Hệ thống bung nén -> Tách file dữ liệu và Media -> Cập nhật vào hệ thống. Thẻ mới lập tức phát được âm thanh/hình ảnh đính kèm.
  - *Export:* Chọn bộ thẻ -> Xuất ra định dạng `.apkg` chứa cả thẻ và Media gốc.
* **Failure & Recovery behavior (APKG):** Nếu file `.apkg` import bị mã hóa hoặc hỏng, chặn tiến trình ngay lập tức, báo lỗi và không làm hỏng dữ liệu hiện tại (fail-safe).
* **User observable interactions:** 
  - Thanh tiến trình Import APKG hiển thị các bước xử lý dữ liệu và Media rõ ràng.
