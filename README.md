# NihongoAI

## 1. Tổng quan (Overview)
NihongoAI là một ứng dụng Desktop được thiết kế dành cho người Việt Nam học tiếng Nhật (tập trung vào JLPT N5 và N4). Dự án lấy cảm hứng từ phương pháp flashcard của Anki, kết hợp với khả năng quản lý tri thức ngôn ngữ có cấu trúc và môi trường luyện tập chủ động được hỗ trợ bởi Trí tuệ Nhân tạo (AI).

Mục tiêu của dự án là biến kiến thức tiếng Nhật thụ động thành kỹ năng chủ động, thông qua luyện dịch câu và giao tiếp tình huống, thay vì chỉ học thuộc lòng mặt chữ.

## 2. Tính năng Cốt lõi (Core Features)
Các tính năng sau đã được định nghĩa trong [Product Requirements Document (PRD)](docs/prd/product-requirements.md):
- **Quản lý Tri thức:** Lưu trữ Từ vựng và Ngữ pháp độc lập, có cấu trúc rõ ràng.
- **Quản lý Bộ thẻ (Deck/Note/Card):** Quản lý cấu trúc Deck lồng nhau (Nested Deck) và tự động sinh thẻ học từ Note.
- **Ôn tập FSRS & Hàng đợi:** Thuật toán lặp lại ngắt quãng (FSRS) kết hợp Daily Review Queue để tối ưu thời gian nhớ.
- **Nhập/Xuất Dữ liệu (CSV/TSV & APKG):** Hỗ trợ chuyển đổi dữ liệu hai chiều mượt mà với hệ sinh thái Anki.
- **Luyện Dịch Câu (Sentence Production):** 
  - *Offline:* Các bài tập dịch câu Việt → Nhật tĩnh từ cơ sở dữ liệu ví dụ.
  - *Online (AI-generated):* AI sinh đề bài tiếng Việt và phân tích chi tiết lỗi sai tiếng Nhật của người dùng.
- **Hội thoại Tình huống (Text Kaiwa):** Chat bằng tiếng Nhật với AI theo chủ đề và trình độ JLPT, tích hợp công cụ phân tích lỗi ngữ pháp.
- **Thống kê Học tập:** Dashboard theo dõi tiến độ với biểu đồ Heatmap.
- **STT & TTS:** Hỗ trợ đọc văn bản và nhận diện giọng nói tiếng Nhật.

## 3. Offline & AI (Sự phân chia môi trường)
Dự án tuân thủ nghiêm ngặt nguyên tắc **Local-first**, đảm bảo hầu hết các chức năng hoạt động hoàn hảo khi không có kết nối Internet.

* **Hoạt động 100% Offline:** 
  - Xem, thêm, sửa, xóa Từ vựng, Ngữ pháp, Deck, Note, Card.
  - Ôn tập Flashcard, lên lịch FSRS, xem Thống kê (Heatmap).
  - Nhập và Xuất dữ liệu (CSV/TSV, APKG).
  - Làm bài tập dịch câu theo luật (Rule-based) đã lưu sẵn cục bộ.
  - Nhận diện giọng nói (STT) và Đọc văn bản (TTS) nếu Hệ điều hành hỗ trợ offline API.
* **Yêu cầu kết nối Internet (AI Cloud Services):**
  - Chấm điểm, phân tích và giải thích lỗi sai khi dịch câu tiếng Nhật.
  - Nhắn tin trong tính năng Hội thoại tình huống (Text Kaiwa) và Phân tích câu ngữ pháp.
  - STT/TTS (Nếu hệ điều hành buộc phải dùng Fallback Cloud API).

*(Lưu ý: Mọi sự cố mất kết nối mạng khi dùng AI đều có cơ chế Recovery giữ nguyên trạng thái, không làm mất dữ liệu của người dùng).*

## 4. Công nghệ Sử dụng (Technology Stack)
- **Giao diện (Frontend):** React, TypeScript, Vite
- **Vỏ ứng dụng Desktop (Desktop Shell):** Tauri 2
- **Xử lý Nghiệp vụ (Local Backend):** Java, Spring Boot, Maven
- **Cơ sở Dữ liệu (Database):** SQLite
- **Quản lý Schema (Migration):** Flyway
- **Tích hợp AI:** Các dịch vụ AI (OpenAI/Gemini...) được gọi gián tiếp thông qua một lớp Abstraction tại Spring Boot Backend.

## 5. Nguyên tắc Phát triển (Development Principles)
- **Offline-first:** Thiết bị cục bộ là nguồn chân lý (Source of Truth). Dữ liệu học tập nằm hoàn toàn trên thiết bị của người dùng.
- **Tách biệt cốt lõi (Core Domain Separation):** Kiến thức (Knowledge) và Học liệu (Learning Material) là hai thực thể riêng biệt.
- **Active Production:** Chú trọng luyện tập dịch câu thay vì chỉ nhận diện Flashcard.
- **AI-assisted learning:** AI chỉ đóng vai trò hỗ trợ phân tích và tạo ngữ cảnh, không thay thế logic nghiệp vụ cốt lõi hay thuật toán FSRS.
- **Deck / Note / Card:** Tuân thủ mô hình dữ liệu Anki-compatible để tổ chức và sinh thẻ linh hoạt.

## 6. Trạng thái Dự án (Project Status)
- [x] Định nghĩa mục tiêu dự án (Project Brief & Context).
- [x] Phân tích Yêu cầu Sản phẩm (PRD).
- [x] Đặc tả Hành vi Chức năng (Feature Specification).
- [ ] Thiết kế Cơ sở Dữ liệu và Kiến trúc Backend.
- [ ] Xây dựng Frontend UI/UX.
- [ ] Triển khai các luồng tính năng.

## 7. Tài liệu Kỹ thuật (Documentation)
Các tài liệu phân tích và thiết kế chi tiết:
- [Product Requirements Document (PRD)](docs/prd/product-requirements.md): Yêu cầu sản phẩm, phạm vi, ràng buộc.
- [Feature Specification](docs/prd/feature-specification.md): Đặc tả chi tiết hành vi (Success, Failure, Recovery, Persistence) cho từng tính năng.
- [Project Guide](.agents/project-guide.md): Quy tắc làm việc cốt lõi của dự án dành cho quá trình phát triển.

## 8. Hướng dẫn Khởi động (Getting Started)

Dự án được chia thành 2 phần độc lập: **Backend** (Spring Boot) và **Frontend/Desktop Shell** (React + Tauri). Để chạy ứng dụng ở chế độ phát triển (Development mode), bạn cần khởi động cả 2 phần cùng lúc.

### Yêu cầu môi trường (Prerequisites)
- **Backend:** Java 17+ và Maven.
- **Frontend/Desktop:** Node.js (khuyến nghị v18+), npm và các công cụ build Native (Rust, C++ build tools) để chạy Tauri.

### Khởi động Backend (Spring Boot)
1. Mở Terminal mới và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Chạy ứng dụng Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   *(Backend sẽ chạy tại `http://localhost:8080` và tự động tạo Database SQLite thông qua Flyway).*

### Khởi động Desktop App (Tauri + React)
1. Mở một Terminal khác và di chuyển vào thư mục `app`:
   ```bash
   cd app
   ```
2. Cài đặt các gói phụ thuộc (chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng Tauri ở chế độ dev:
   ```bash
   npm run tauri dev
   ```
   *(Lệnh này sẽ tự động khởi động Vite dev server và mở cửa sổ ứng dụng Desktop Native).*
