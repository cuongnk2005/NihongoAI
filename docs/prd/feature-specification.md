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
  - Hỗ trợ gắn nhiều nhãn (Tags) cho từng mục tri thức (ví dụ: cấp độ JLPT, bài học Minna no Nihongo, chủ đề đời sống).
  - Với mục Ngữ pháp, người dùng có thể thêm/bớt nhiều câu ví dụ (Multiple examples) độc lập kèm dịch nghĩa tiếng Việt.

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
* **Keyboard navigation (Tối ưu tốc độ):** 
  - Nhấn phím `Space` hoặc `Enter`: Lật sang mặt sau của thẻ.
  - Sau khi lật mặt sau, nhấn phím số `1`: Đánh giá Again; `2`: Hard; `3`: Good; `4`: Easy.
  - Toàn bộ phiên ôn tập có thể điều khiển 100% bằng bàn phím mà không cần rê chuột.
* **Undo/Hoàn tác lượt đánh giá:** Nếu người dùng lỡ bấm nhầm phím đánh giá, có thể bấm phím tắt `Ctrl + Z` (hoặc nút "Hoàn tác/Undo" trên góc giao diện) để quay lại thẻ trước đó. Hệ thống sẽ khôi phục lại trạng thái FSRS trước đó và xóa bản ghi ReviewLog đánh giá nhầm.
* **Loading/pending state:** Nếu việc tính toán FSRS hoặc nạp thẻ mới cần thời gian, giao diện sẽ hiển thị trạng thái chờ (loading indicator) phù hợp để người dùng biết hệ thống đang xử lý.
* **Persistence & Recovery behavior:** Nhật ký đánh giá được lưu cục bộ ngay lập tức. Nếu tắt ứng dụng giữa phiên ôn tập, lần mở tiếp theo hệ thống sẽ nạp lại đúng hàng đợi còn dang dở. Lịch sử ôn tập không bao giờ bị ghi đè khi cập nhật lịch ôn tiếp theo.
* **Empty state:** Khi đã ôn hết số lượng thẻ trong ngày, giao diện hiển thị thông báo chúc mừng "Bạn đã hoàn thành mục tiêu hôm nay!".
* **User observable interactions:** 
  - Bên dưới mỗi nút đánh giá (Again, Hard, Good, Easy) luôn hiển thị dự báo khoảng thời gian thẻ sẽ quay lại (Ví dụ: `10m`, `3d`, `1.5mo`).
  - Giao diện có thanh tiến trình (Progress bar) thể hiện tỷ lệ thẻ đã ôn trên tổng số thẻ của phiên.

---

## Feature 4: Nhập/Xuất Dữ liệu CSV/TSV (FR-04)
Tính năng trao đổi dữ liệu với bên ngoài để hỗ trợ tương thích với Anki.

* **Success flow (Import):** Chọn "Nhập dữ liệu" -> Tải file `.csv`/`.tsv` lên -> Màn hình hiển thị bảng Mapping -> Chọn ánh xạ cột -> Chọn chính sách xử lý trùng lặp -> Nhấn "Bắt đầu nhập" -> Hiển thị kết quả thành công và số bản ghi đã nhập.
* **Success flow (Export):** Chọn "Xuất dữ liệu" -> Chọn phạm vi/Deck cần xuất -> Chọn định dạng (CSV/TSV) -> Hệ thống tạo file và lưu xuống máy tính. File export giữ đúng các trường dữ liệu và có thể Import ngược lại mà không mất mát thông tin.
* **Chính sách xử lý trùng lặp (Duplicate handling policy):**
  - *Bỏ qua (Skip duplicates):* Nếu từ/note đã tồn tại trong CSDL, giữ nguyên bản ghi cũ và bỏ qua dòng mới.
  - *Ghi đè (Update/Overwrite):* Cập nhật thông tin mới vào bản ghi đã có.
  - *Cho phép trùng (Allow duplicates):* Vẫn tạo mới bản ghi riêng biệt.
* **Hỗ trợ định dạng học tập 4 cột tiêu chuẩn:** Tương thích trực tiếp với định dạng phổ biến của người học tiếng Nhật: Cột 1 (Cách đọc Hiragana / Ứng viên Kanji), Cột 2 (Kanji chính xác), Cột 3 (Nghĩa tiếng Việt & Âm Hán Việt), Cột 4 (Câu ví dụ tiếng Nhật & Dịch nghĩa tiếng Việt).
* **Mã hóa ký tự (Encoding Support):** Tự động nhận diện chuẩn xác UTF-8 và UTF-8 BOM, đảm bảo không bị lỗi font tiếng Nhật hoặc dấu tiếng Việt.
* **Validation behavior:** Nếu file Import không đúng định dạng hoặc rỗng, chặn ngay lập tức. Với Export, nếu Deck trống, hệ thống không cho phép xuất và hiển thị thông báo.
* **Failure & Recovery behavior:** 
  - *Import:* Nếu lỗi giữa chừng (ví dụ: dòng bị lệch cột nghiêm trọng), hệ thống hoàn tác (rollback) toàn bộ theo Transaction an toàn, hiển thị chi tiết số dòng bị lỗi (Row number) và nguyên nhân để người dùng sửa file.
  - *Export:* Nếu lỗi ghi file (thiếu quyền, đầy bộ nhớ), hệ thống báo lỗi rõ ràng và giữ nguyên trạng thái ứng dụng, không crash.
* **User observable interactions:** 
  - Xem trước (Preview) 5 dòng đầu khi Import để kiểm tra font chữ và xác nhận ánh xạ cột trực quan trước khi thực hiện lưu dữ liệu.

---

## Feature 5: Luyện dịch câu cốt lõi (FR-05)
Tính năng kết hợp Rule-based offline và AI-generated để kiểm tra khả năng ghép câu.

* **Success flow (Rule-based Offline):** Hệ thống tự động trích xuất các "Câu ví dụ" có sẵn trong cơ sở dữ liệu Từ vựng/Ngữ pháp để tạo thành bài tập dịch câu Việt -> Nhật. Khi người dùng nộp câu dịch tiếng Nhật, hệ thống đối chiếu và chấm điểm tức thì không cần Internet.
* **Success flow (AI-generated Online):** Dựa vào Từ vựng/Ngữ pháp mục tiêu, AI sinh một câu tiếng Việt -> Người dùng nhập câu dịch tiếng Nhật -> Nộp bài -> AI chấm điểm đa chiều và trả về phản hồi chi tiết.
* **Cơ chế đánh giá đa chiều của AI (Structured Multi-dimensional Evaluation):**
  - AI không chỉ so khớp chuỗi tĩnh (Exact string match), vì một câu tiếng Nhật có nhiều cách diễn đạt đúng ngữ cảnh.
  - Đánh giá theo cấu trúc: Điểm tổng thể (0-100), Điểm ngữ nghĩa (Meaning score), Điểm ngữ pháp (Grammar score), Điểm độ tự nhiên (Naturalness score).
  - Danh sách lỗi cụ thể: Lỗi ngữ pháp (`grammarErrors`), lỗi từ vựng (`vocabularyErrors`).
  - Đưa ra câu gợi ý tự nhiên (`suggestedAnswer`) và lời giải thích chi tiết bằng tiếng Việt (`explanationVi`).
* **Loading/pending state:** Khi chờ AI sinh đề hoặc chấm điểm, nút bấm hiển thị trạng thái xoay vòng (Spinner) với chữ "AI đang suy nghĩ...". Giao diện không bị khóa (non-blocking), người dùng vẫn có thể bấm "Hủy" để quay lại.
* **Failure & Recovery behavior (AI Error):** Nếu mất kết nối Internet hoặc AI phản hồi quá lâu (Timeout), hiển thị cảnh báo lỗi mạng. Nội dung người dùng vừa gõ được giữ nguyên trên màn hình, nút "Nộp bài" đổi thành "Thử lại".
* **Persistence behavior:** Mọi kết quả bài làm (đề bài, câu trả lời, phân tích nhận xét của AI) đều được lưu vào Lịch sử Luyện tập (Practice History).
* **Empty state:** Nếu người dùng chọn luyện Rule-based nhưng thư viện Từ vựng/Ngữ pháp chưa có "Ví dụ" nào, hệ thống hiển thị thông báo: "Chưa có đủ dữ liệu ví dụ để tạo bài tập. Hãy quay lại học thêm từ vựng mới!".
* **User observable interactions:** 
  - Trên màn hình Lịch sử Luyện tập, người dùng có thể nhấp vào một bài cũ để xem lại toàn bộ phần giải thích lỗi sai của AI như lúc mới làm xong.

---

## Feature 6: Hội thoại Tình huống (Text Kaiwa) (FR-06)
Môi trường chat mô phỏng thực tế với mức độ khó được kiểm soát theo JLPT.

* **Success flow:** Người dùng chọn chủ đề (VD: Đi ăn nhà hàng, Hỏi đường ga tàu) và cấp độ (VD: N5, N4) -> Nhấn "Bắt đầu hội thoại". AI gửi tin nhắn mở màn tiếng Nhật. Người dùng gõ câu trả lời, AI tiếp tục phản hồi tự nhiên theo đúng ngữ cảnh.
* **Chế độ sửa lỗi linh hoạt (Correction Modes):**
  - *Sửa lỗi từng lượt (Turn-by-turn analysis):* Phân tích câu tiếng Nhật của người học và đưa ra góp ý sau mỗi lượt trao đổi mà không làm ngắt mạch trò chuyện.
  - *Phân tích theo yêu cầu (On-demand Analysis):* Người dùng chủ động bấm nút "Phân tích ngữ pháp" tại một tin nhắn cụ thể khi muốn xem phân tích sâu.
  - *Tổng kết cuối buổi (Post-session Summary):* Nhận báo cáo tổng thể về độ tự nhiên, từ vựng và ngữ pháp sau khi nhấn "Kết thúc hội thoại".
* **Gợi ý khi bí câu (Sentence Hint / Scaffolding):** Người dùng có thể nhấn nút "Gợi ý" để AI đưa ra 1-2 mẫu câu hoặc từ vựng gợi ý phù hợp cho ngữ cảnh hiện tại.
* **Validation behavior:** Người dùng không thể gửi tin nhắn rỗng hoặc tin nhắn chỉ chứa khoảng trắng.
* **Failure & Recovery behavior:** Nếu mất mạng khi đang gửi tin nhắn chat hoặc khi yêu cầu "Phân tích câu", hệ thống giữ nguyên nội dung gõ, hiện cảnh báo lỗi mạng (hoặc icon dấu chấm than `!`) và cung cấp nút `Retry` để thử lại khi có mạng.
* **Persistence behavior:** Cuộc hội thoại được lưu lại vĩnh viễn trong cơ sở dữ liệu cục bộ. Người dùng có thể xem lại lịch sử các đoạn chat cũ.

---

## Feature 7: Thống kê học tập (FR-07)
Màn hình Dashboard báo cáo dữ liệu học tập cá nhân toàn diện.

* **Chỉ số theo dõi chính:**
  - *Biểu đồ đóng góp (Study Heatmap):* Thể hiện tần suất và cường độ học tập theo từng ngày trong năm.
  - *Dự báo thẻ đến hạn (Due Forecast):* Thống kê số lượng thẻ dự kiến sẽ cần ôn tập trong các ngày tới (1 ngày, 3 ngày, 7 ngày).
  - *Tỷ lệ duy trì trí nhớ (Retention Rate):* Thể hiện tỷ lệ ghi nhớ thực tế đạt được so với mục tiêu FSRS (ví dụ 90%).
  - *Tổng lượng tri thức đã học:* Số từ vựng, ngữ pháp, thẻ đã nạp và thời gian học tập tích lũy.
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

---

## Feature 9: Quản lý Cài đặt & Cấu hình Hệ thống (FR-09)
Quản trị cấu hình AI, thuật toán FSRS và sao lưu an toàn cho người dùng Desktop.

* **Success flow (Cấu hình AI Provider):** Người dùng mở mục Cài đặt -> Chọn AI Provider (Google Gemini, OpenAI, hoặc DeepSeek) -> Chọn Model tương ứng -> Nhập API Key -> Chọn trình độ JLPT mặc định -> Nhấn "Lưu Cấu Hình". Hệ thống gửi thông tin bảo mật xuống Spring Boot backend lưu vào CSDL cục bộ và thông báo "Đã lưu cấu hình AI thành công!".
* **Success flow (Kiểm tra kết nối AI - Test Connection):** Người dùng bấm "Kiểm tra kết nối". Backend gửi 1 tín hiệu ping kiểm tra nhẹ tới AI Provider. Nếu thành công, giao diện báo tick xanh "Kết nối thành công!". Nếu thất bại (sai API Key hoặc mất mạng), hệ thống thông báo nguyên nhân cụ thể mà không làm gián đoạn trải nghiệm của người dùng.
* **Bảo mật & Hiển thị API Key:** Ô nhập API Key mặc định ở dạng che ký tự (`type="password"`). Có nút icon con mắt để bật/tắt hiển thị khi cần kiểm tra lại chuỗi khóa đã nhập. Key chỉ được lưu trữ và sử dụng bởi Spring Boot backend, tuyệt đối không gửi lộ ra ngoài client.
* **Sao lưu dữ liệu (Database Backup):** Người dùng có thể nhấn nút "Tạo bản sao lưu CSDL", hệ thống mở hộp thoại lưu file của Desktop để người dùng chọn vị trí lưu file `.sqlite` dự phòng.
* **User observable interactions:** 
  - Sau khi lưu, thông báo thành công hiển thị dạng toast trong 3 giây và tự động ẩn.
  - Thay đổi cấp độ JLPT mặc định tại đây sẽ tự động cập nhật làm giá trị ban đầu cho các màn hình Luyện dịch câu và Hội thoại Kaiwa.

