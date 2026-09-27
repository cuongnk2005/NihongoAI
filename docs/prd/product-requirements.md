# Product Requirements Document (PRD)
> **Dự án:** NihongoAI (Japanese Learning Desktop App)  
> **Tài liệu tham chiếu:** `project-guide.md`

---

## 1. Mục tiêu Sản phẩm (Product Goals)
Xây dựng một ứng dụng Desktop dành cho người Việt Nam học tiếng Nhật (tập trung vào trình độ sơ cấp JLPT N5 và N4 ở giai đoạn đầu, sau đó mở rộng lên các cấp độ cao hơn). 
Sản phẩm được lấy cảm hứng từ phương pháp flashcard của Anki nhưng mở rộng khả năng bằng cách quản lý tri thức tiếng Nhật có cấu trúc và cung cấp môi trường luyện tập có sự hỗ trợ của AI (AI-assisted practice).

---

## 2. Phạm vi và Cốt lõi (Scope & Non-Goals)

### 2.1 Phạm vi cốt lõi (In-Scope)
Hệ thống xoay quanh 3 tầng dữ liệu cốt lõi (Core Domain Separation):
1. **Tri thức (Knowledge):** Quản lý Từ vựng và Ngữ pháp có cấu trúc.
2. **Học liệu (Learning Material):** Quản lý bộ thẻ (Deck), ghi chú (Note), thẻ học (Card), câu hỏi luyện tập (PracticeQuestion).
3. **Trạng thái học tập (Learning State):** Lịch sử ôn tập (ReviewHistory), trạng thái FSRS (ReviewState), lịch sử luyện tập (PracticeHistory), thống kê (Statistics).

**Các tính năng nằm trong phạm vi (Từ Phase 1 đến Phase 8):**
- Quản lý từ vựng, ngữ pháp, deck, note, card.
- Ôn tập flashcard với thuật toán FSRS.
- Import/Export dữ liệu CSV/TSV tương thích Anki (kèm ánh xạ trường/field mapping).
- Luyện tập dịch câu Việt -> Nhật (bài tập dựa trên luật và bài tập do AI sinh ra).
- Trí tuệ nhân tạo (AI) đánh giá câu trả lời và giải thích bằng tiếng Việt.
- Hội thoại văn bản (Text Kaiwa) có kiểm soát độ khó theo JLPT.
- Tích hợp Speech-to-Text (STT), Text-to-Speech (TTS) và Import/Export định dạng APKG (được xếp ở Phase cuối).
- Thống kê tiến độ học tập cơ bản.

### 2.2 Nằm ngoài phạm vi (Non-Goals / Future Features)
Các tính năng sau đã được quyết định rõ là không thuộc phạm vi phát triển hiện tại (Không được triển khai sớm):
- Đồng bộ đám mây (Cloud sync).
- Hệ thống tài khoản người dùng (User accounts).
- Phiên bản Web và Mobile application.
- Tích hợp nhiều nhà cung cấp AI cùng lúc trên giao diện người dùng (hiện tại chỉ cần 1 Provider thông qua lớp abstraction của Backend).
- Tích hợp từ điển tiếng Nhật (Japanese dictionary integration).
- Âm thanh gốc (Audio files) và Nhận dạng ký tự quang học (OCR).
- Lộ trình học tập JLPT tự động (JLPT study plans) và Thống kê học tập nâng cao (Advanced learning analytics).

---

## 3. Ràng buộc Hệ thống (System Constraints)

Dựa trên nguyên tắc kỹ thuật đã thống nhất, sản phẩm phải tuân thủ nghiêm ngặt các ràng buộc sau:
1. **Kiến trúc Công nghệ:** 
   - Frontend: React, TypeScript, Vite.
   - Desktop Shell: Tauri 2. (Tuyệt đối không đưa business logic vào Rust. Rust chỉ dùng cho các API tương tác sâu với native Desktop).
   - Local Backend: Java, Spring Boot, Maven.
   - Database: SQLite (quản lý migration bằng Flyway).
   - AI: Các nhà cung cấp AI bên ngoài phải được gọi thông qua Spring Boot backend qua một lớp trừu tượng (AI Provider Abstraction), không gọi trực tiếp từ Frontend. Frontend chỉ giao tiếp với Backend qua `localhost`.
2. **Nguyên tắc Local-First (Offline Availability):**
   - Ứng dụng phải hoạt động 100% offline đối với các tác vụ: Quản lý Deck/Note/Card, Từ vựng/Ngữ pháp, Ôn tập thẻ, Lên lịch FSRS, Xem lịch sử và thống kê, Nhập/Xuất CSV/TSV, và làm các bài tập đã được lưu cục bộ.
   - Internet chỉ được yêu cầu cho các tính năng trực tiếp gọi AI từ xa. Nếu AI gặp lỗi (mất mạng, timeout), hệ thống không được sập và người dùng vẫn phải truy cập được các tính năng học flashcard bình thường.

---

## 4. Yêu cầu Chức năng (Functional Requirements - FR)

Mỗi yêu cầu chức năng (FR) dưới đây được thiết kế để có thể quan sát và kiểm chứng (Acceptance Signals) trong quá trình nghiệm thu.

### FR-01: Quản lý Tri thức Từ vựng & Ngữ pháp (Knowledge Management)
Hệ thống cho phép người dùng tạo, đọc, cập nhật, xóa (CRUD) các mục tri thức ngôn ngữ một cách có cấu trúc, không lưu dưới dạng văn bản thuần túy.
- **Từ vựng:** Phải lưu trữ được ít nhất các trường: Từ gốc (`word`), Cách đọc (`reading`), Nghĩa tiếng Việt (`meaningVi`), Từ loại (`partOfSpeech`), Cấp độ JLPT (`jlptLevel`), và Ghi chú (`notes`). (Cấu trúc dữ liệu / Domain model cần linh hoạt để có thể mở rộng các trường thông tin trong tương lai như: kanji info, pitch accent, frequency, examples, audio, tags).
- **Ngữ pháp:** Phải lưu trữ được ít nhất các trường: Mẫu câu (`pattern`), Ý nghĩa tiếng Việt (`meaningVi`), Cấu trúc (`structure`), Giải thích (`explanation`), Các câu ví dụ (`examples`), Cấp độ JLPT (`jlptLevel`), và Nhãn (`tags`).
- **Acceptance Signals:** 
  - Người dùng có thể điền form thêm một từ vựng mới với các trường riêng biệt. Khi xem lại, thông tin được hiển thị đúng cấu trúc đã nhập. Dữ liệu này tồn tại offline sau khi khởi động lại app.

### FR-02: Quản lý Bộ thẻ & Thẻ học (Deck, Note, Card Management)
Hệ thống áp dụng mô hình kiến trúc Anki-compatible để quản lý học liệu.
- Người dùng có thể tạo và quản lý danh sách các Bộ thẻ (Deck).
- Người dùng có thể tạo Ghi chú (Note) chứa thông tin gốc.
- Từ một Note, hệ thống có thể tạo ra một hoặc nhiều Thẻ học (Card) theo các chiều khác nhau (ví dụ: chiều Nhật-Việt, chiều Việt-Nhật).
- **Acceptance Signals:** 
  - Khi người dùng tạo 1 Note có 2 mặt (Mặt A, Mặt B) và yêu cầu sinh thẻ 2 chiều, hệ thống sẽ tạo ra 2 Card độc lập trong Deck.

### FR-03: Ôn tập lặp lại ngắt quãng (FSRS Spaced Repetition) & Daily Review Queue
Hệ thống quản lý danh sách thẻ cần ôn tập trong ngày và lên lịch ôn tập cho từng Card dựa trên thuật toán FSRS.
- Cung cấp hàng đợi ôn tập hàng ngày (Daily review queue).
- Khi ôn tập, người dùng nhìn thấy mặt trước của thẻ. Sau khi lật thẻ, người dùng tự đánh giá chất lượng ghi nhớ (ví dụ: Again, Hard, Good, Easy).
- Hệ thống ghi nhận lịch sử ôn tập (ReviewHistory) và cập nhật trạng thái (ReviewState) để tính toán ngày ôn tập tiếp theo.
- **Acceptance Signals:** 
  - (Daily Queue): Trên màn hình chính hiển thị số lượng thẻ cần ôn tập trong ngày (Due today). Khi nhấn "Bắt đầu", hệ thống lần lượt hiển thị đúng các thẻ trong hàng đợi này.
  - (FSRS): Sau khi chọn mức độ "Good" cho một thẻ mới, thẻ đó sẽ không xuất hiện lại ngay lập tức mà được thông báo lên lịch vào một thời điểm trong tương lai. Người dùng có thể xem lại lịch sử đánh giá ngay trên màn hình chi tiết của thẻ đó.

### FR-04: Nhập/Xuất Dữ liệu CSV/TSV (Data Import/Export)
Hệ thống cho phép nhập và xuất dữ liệu tương thích với các nền tảng khác (đặc biệt là Anki).
- Hỗ trợ định dạng CSV và TSV.
- Cho phép người dùng ánh xạ các cột (Field mapping) từ file tải lên vào các trường tương ứng của Note/Vocabulary/Grammar, đồng thời hỗ trợ Import Tags.
- **Acceptance Signals:** 
  - Người dùng tải lên một file CSV có 3 cột. Giao diện xuất hiện hộp thoại cho phép chọn Cột 1 -> `Word`, Cột 2 -> `Reading`, Cột 3 -> `MeaningVi`. Dữ liệu được nhập thành công và lập tức hiển thị đầy đủ trong danh sách quản lý từ vựng.

### FR-05: Luyện tập dịch câu Việt -> Nhật cốt lõi (Sentence Production)
Tính năng then chốt giúp học viên thực hành biến kiến thức thụ động thành chủ động.
- Hệ thống sử dụng một danh sách mục tiêu (Từ vựng/Ngữ pháp từ CSDL) để sinh ra đề bài là một câu tiếng Việt. (Giai đoạn đầu dùng rule-based, sau đó dùng AI để sinh câu).
- Người dùng nhập câu trả lời tiếng Nhật bằng bàn phím.
- Hệ thống gửi câu trả lời cho AI (hoặc rule engine) để đánh giá. Không áp dụng phương pháp "So khớp chuỗi chính xác tuyệt đối" (Exact string matching), vì tiếng Nhật có nhiều cách diễn đạt đúng.
- AI sẽ chấm điểm và cung cấp phần giải thích lỗi sai bằng tiếng Việt. Hệ thống lưu lại lịch sử làm bài (PracticeHistory).
- **Acceptance Signals:** 
  - (Rule-based / Offline): Ở chế độ luyện tập theo luật, hệ thống hiển thị một câu hỏi tĩnh (trắc nghiệm hoặc điền từ) được nạp từ dữ liệu cục bộ. Người học nộp bài và nhận kết quả đối chiếu ngay lập tức mà không cần kết nối Internet hay AI.
  - (AI-generated): Dựa vào mục tiêu là từ `食べる` và ngữ pháp `～たことがある`, AI sinh ra câu tiếng Việt "Tôi đã từng ăn...". Người dùng gõ câu tiếng Nhật đổi trật tự từ nhưng đúng ngữ pháp. Hệ thống báo "Đúng" và có lời giải thích từ AI thay vì báo sai do không khớp 100% với một chuỗi tĩnh.
  - (Practice History): Người dùng có thể mở màn hình Lịch sử Luyện tập để xem lại danh sách các câu đã làm trong quá khứ, kết quả chấm điểm và chi tiết phân tích lỗi sai tương ứng.

### FR-06: Hội thoại tình huống (Text Kaiwa)
Môi trường luyện tập giao tiếp bằng văn bản với AI.
- Hệ thống khởi tạo một cuộc hội thoại với AI, mức độ từ vựng và ngữ pháp của AI sẽ được kiểm soát theo cấp độ JLPT (Ví dụ: N5 hoặc N4) để phù hợp với trình độ học viên.
- **Acceptance Signals:** 
  - Khi thiết lập trình độ N5, câu trả lời của AI trong khung chat chỉ sử dụng ngữ pháp cơ bản (ví dụ: です/ます form) và từ vựng dễ hiểu.

### FR-07: Thống kê học tập (Learning Statistics)
Hệ thống cung cấp cái nhìn tổng quan về tiến độ.
- Thống kê các chỉ số ôn tập cơ bản từ `ReviewHistory` và `PracticeHistory`.
- **Acceptance Signals:** 
  - Trên màn hình chính (Dashboard), người dùng có thể xem biểu đồ lượng thẻ đã hoàn thành (Ví dụ: Heatmap chuỗi ngày học) và các chỉ số thống kê tỷ lệ ghi nhớ.

### FR-08: Nâng cao Trải nghiệm & Tương thích Anki gốc (Phase 8)
- Cung cấp khả năng nhận diện giọng nói (STT) khi người dùng luyện phát âm hoặc nhập liệu Kaiwa.
- Cung cấp khả năng đọc văn bản (TTS) tiếng Nhật cho thẻ học hoặc tin nhắn Kaiwa.
- Hỗ trợ Import và Export bộ thẻ dưới định dạng gốc của Anki (`.apkg`).
- **Acceptance Signals:** 
  - (STT/TTS): Người dùng bấm nút phát âm trên thẻ từ vựng, hệ thống phát ra âm thanh tiếng Nhật tương ứng. Mở mic nói tiếng Nhật, hệ thống chuyển thành văn bản trong khung nhập liệu.
  - (APKG): Người dùng tải lên file `deck.apkg`, hệ thống bung nén và nhập thành công các Note/Card, lập tức hiển thị bộ thẻ mới trên giao diện cùng với hình ảnh/âm thanh đính kèm hoạt động bình thường.

### FR-09: Cấu hình Hệ thống & Quản lý AI Provider (System Settings & AI Configuration)
Cung cấp khu vực quản trị thiết lập ứng dụng và tích hợp AI cho người dùng.
- **Quản lý AI Provider:** Cho phép chọn giữa các nhà cung cấp AI (Google Gemini, OpenAI, DeepSeek) và lựa chọn mô hình tương ứng (ví dụ: Gemini 1.5 Flash/Pro, GPT-4o/mini, DeepSeek Chat V3).
- **Bảo mật API Key:** Nhập và lưu trữ an toàn API Key cục bộ tại SQLite/Backend. Có nút ẩn/hiện API Key để kiểm tra khi nhập. Không bao giờ gửi lộ API Key ra giao diện client.
- **Trình độ JLPT mặc định:** Thiết lập cấp độ JLPT mặc định (N5, N4...) cho các tính năng sinh bài tập và Kaiwa.
- **Tùy chỉnh thuật toán FSRS:** Cho phép người dùng nâng cao điều chỉnh tỷ lệ duy trì mong muốn (Target Retention, mặc định 90%) và khoảng cách ôn tập tối đa (Maximum Interval).
- **Sao lưu dữ liệu cục bộ (Backup & Restore):** Hỗ trợ xuất/sao lưu CSDL SQLite ra file dự phòng để bảo vệ dữ liệu học tập cá nhân.
- **Acceptance Signals:** 
  - Người dùng nhập API Key, chọn Gemini 1.5 Flash và bấm "Lưu Cấu Hình", hệ thống lưu thành công và hiển thị thông báo phản hồi.
  - Khi ngắt mạng hoặc nhập sai Key, bấm nút "Kiểm tra kết nối" (Test Connection) sẽ trả về thông báo lỗi thân thiện thay vì làm treo ứng dụng.

---

## 5. Yêu cầu Phi Chức năng (Non-Functional Requirements - NFR)

### NFR-01: Hiệu năng & Tốc độ phản hồi (Performance & Responsiveness)
- **Tốc độ lật thẻ và chuyển thẻ:** Trong quá trình ôn tập Flashcard (FR-03), thời gian chuyển tiếp giữa câu hỏi, lật mặt sau và chuyển sang thẻ tiếp theo sau khi đánh giá phải đạt dưới 100ms để đảm bảo trải nghiệm ôn tập tốc độ cao.
- **Thời gian khởi động ứng dụng:** Ứng dụng Desktop (Tauri Shell + Local Spring Boot + SQLite) sẵn sàng tương tác trong vòng dưới 3 giây trên cấu hình máy tính tiêu chuẩn.
- **Xử lý tập dữ liệu lớn:** Danh sách từ vựng và ngữ pháp hỗ trợ nạp dữ liệu mượt mà, áp dụng phân trang (Pagination) hoặc cuộn ảo (Virtual Scrolling) khi số lượng mục vượt quá 10,000 bản ghi.

### NFR-02: Bảo mật & Quyền riêng tư cục bộ (Security & Privacy)
- **Bảo vệ Secrets & API Keys:** Tuyệt đối không hardcode API Key trong mã nguồn. API Key được lưu an toàn trong SQLite cục bộ thông qua backend Spring Boot. Giao diện React không bao giờ lưu trữ hoặc để lộ API Key trực tiếp.
- **Giới hạn kết nối mạng cục bộ:** Backend Spring Boot chỉ lắng nghe trên giao diện mạng cục bộ (`127.0.0.1` / Loopback), không mở cổng ra ngoài mạng LAN/Internet.
- **Quyền riêng tư dữ liệu học tập (AI Privacy):** Khi gửi yêu cầu tới các nhà cung cấp AI, hệ thống chỉ gửi dữ liệu tối thiểu cần thiết phục vụ bài tập (từ vựng/ngữ pháp mục tiêu, trình độ JLPT, ngữ cảnh câu). Tuyệt đối không gửi toàn bộ cơ sở dữ liệu học tập của người dùng lên dịch vụ AI bên ngoài.

### NFR-03: Tính sẵn sàng & Toàn vẹn dữ liệu (Reliability & Data Integrity)
- **Tính khả dụng Offline (Local-First):** 100% các tính năng quản lý Deck, Note, Card, Từ vựng, Ngữ pháp, Ôn tập FSRS, Lịch sử và Thống kê phải hoạt động bình thường khi hoàn toàn không có kết nối Internet.
- **Giao dịch an toàn (ACID Transactions):** 
  - Quá trình đánh giá thẻ (cập nhật `ReviewState` và ghi `ReviewLog`) phải được thực thi trong một Transaction duy nhất để không bao giờ xảy ra tình trạng trạng thái FSRS thay đổi nhưng mất vết lịch sử.
  - Lịch sử ôn tập không bao giờ bị ghi đè khi cập nhật lịch ôn tiếp theo.
  - Quá trình Import CSV/TSV/APKG phải hỗ trợ cơ chế Rollback an toàn nếu xảy ra lỗi nghiêm trọng giữa chừng.
- **Phục hồi sự cố AI (Graceful Degradation):** Khi dịch vụ AI gặp lỗi (Timeout, Rate Limit, Mất mạng), hệ thống phải giữ nguyên nội dung bài làm của người dùng, không làm hỏng dữ liệu và cung cấp tùy chọn thử lại (Retry).

### NFR-04: Đa ngôn ngữ, Kiểu chữ & Mã hóa (Typography & Encoding)
- **Hỗ trợ Unicode toàn diện:** Hỗ trợ chuẩn xác UTF-8 (bao gồm UTF-8 with BOM và UTF-8 without BOM) cho Kanji, Hiragana, Katakana và tiếng Việt có dấu, không để xảy ra hiện tượng vỡ font (Mojibake).
- **Hiển thị chữ tiếng Nhật rõ nét:** Cỡ chữ tiếng Nhật trên các giao diện thẻ học và bài tập phải đảm bảo độ nét và kích thước tối thiểu thoải mái cho mắt người học (tối thiểu 24px - 36px cho từ vựng lớn trên Flashcard).
- **Hỗ trợ Furigana linh hoạt:** Furigana chỉ hiển thị khi người học chủ động yêu cầu hoặc tại các chế độ học có cấu hình bật, tránh làm rối mắt người học ở trình độ trung - cao cấp.

### NFR-05: Trải nghiệm người dùng Desktop (Desktop Usability & Accessibility)
- **Điều khiển phím tắt tiện lợi:** Toàn bộ quy trình ôn tập Flashcard phải có thể thực hiện 100% bằng bàn phím (Phím `Space`/`Enter` để lật thẻ, phím `1`, `2`, `3`, `4` tương ứng với Again, Hard, Good, Easy; phím `Z` để Hoàn tác/Undo).
- **Thiết kế Desktop-First:** Giao diện tối ưu cho kích thước màn hình máy tính, hỗ trợ điều chỉnh kích thước cửa sổ (Resizable Window), bố cục thanh điều hướng rõ ràng, hỗ trợ trạng thái trống (Empty State) và hiệu ứng tải (Skeleton Loading) đẹp mắt.

---

## 6. Lộ trình Triển khai Phân kỳ (Phase Implementation Roadmap)

| Giai đoạn (Phase) | Trọng tâm Triển khai | Yêu cầu Chức năng (FR) liên quan |
| :--- | :--- | :--- |
| **Phase 1** | Nền tảng hạ tầng: Tauri 2, React TypeScript, Spring Boot, SQLite, Flyway, Local IPC/REST. | Hạ tầng chung, NFR-01, NFR-02 |
| **Phase 2** | Quản lý Dữ liệu tri thức & Học liệu: Vocabulary, Grammar, Decks, Notes, Cards. | FR-01, FR-02 |
| **Phase 3** | Hệ thống Ôn tập FSRS, Hàng đợi học tập hàng ngày, Lịch sử ôn tập, Thống kê cơ bản. | FR-03, FR-07 |
| **Phase 4** | Nhập/Xuất dữ liệu: CSV/TSV Import/Export kèm Field Mapping, Quản lý Nhãn (Tags). | FR-04 |
| **Phase 5** | Luyện dịch câu Việt -> Nhật: Bài tập theo luật (Rule-based), Lịch sử luyện tập (PracticeHistory). | FR-05 (Offline Rule-based) |
| **Phase 6** | Tích hợp AI: Lớp trừu tượng AI Provider, Sinh đề dịch câu, Chấm điểm đa chiều, Giải thích lỗi tiếng Việt, Cấu hình Settings. | FR-05 (AI-powered), FR-09 |
| **Phase 7** | Hội thoại Kaiwa: Text-based Kaiwa có kiểm soát độ khó JLPT, phân tích ngữ pháp theo yêu cầu. | FR-06 |
| **Phase 8** | Nâng cao & Hoàn thiện: Text-to-Speech (TTS), Speech-to-Text (STT), Import/Export file `.apkg` của Anki gốc. | FR-08 |

---
*(Bản PRD này đóng vai trò là "Kinh thánh" cho dự án, giới hạn chặt chẽ phạm vi kỹ thuật và chức năng để team phát triển tuân thủ đúng định hướng cốt lõi được giao).*
