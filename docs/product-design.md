# Đặc tả Thiết kế Sản phẩm Chính thức (Product Design Specification - P4.3)
> **Dự án:** NihongoAI (Japanese Learning Desktop App)  
> **Hướng thiết kế được chọn:** **Direction C — Kyoto Tactile Studio**  
> **Tham chiếu trực quan:** `design/concepts/concept-c-kyoto-studio.html`  
> **Trạng thái:** ĐÃ PHÊ DUYỆT (Approved & Locked)

---

## 1. Quyết định Thiết kế & Cơ sở Thực nghiệm (Design Decision & Evidence)

Sau quá trình kiểm toán đa chiều tại bước P4.3, **Direction C: Kyoto Tactile Studio** chính thức được phê duyệt làm ngôn ngữ thiết kế đồng nhất cho toàn bộ hệ thống NihongoAI.

### Các ưu điểm vượt trội đã được kiểm chứng:
1. **Độ tương phản vượt chuẩn AAA (14:1):** Nền đá ngà `#EFECE6` kết hợp mực đen sâu `#0F172A` đảm bảo chữ Hán (Kanji) và chữ Kana luôn sắc cạnh, không gây nhòe nét hay mỏi mắt trong mọi điều kiện ánh sáng.
2. **Phản hồi xúc giác chân thực (Tactile Mechanics):** Nút bấm lún dứt khoát khi click (`active: translate 2px, 2px; box-shadow: 1px 1px 0px`), mang lại cảm giác cơ học rõ ràng, hỗ trợ tối đa cho nhịp ôn tập tốc độ cao.
3. **Phân cấp trạng thái FSRS chuẩn xác:** 4 mức đánh giá (`Again`, `Hard`, `Good`, `Easy`) được gán mã màu pastel chuyên biệt, kết hợp nhãn dự báo chu kỳ thời gian và keycap số `1`-`4` nổi bật, giúp giảm thiểu sai sót khi bấm phím nhanh.
4. **Hiệu năng desktop tối ưu:** 100% sử dụng CSS Box Model và Shadow thuần, không lạm dụng hiệu ứng kính mờ (blur) làm tốn tài nguyên GPU, đảm bảo đạt 60fps mượt mà trên desktop shell Tauri.

---

## 2. Hệ thống Design Tokens (Design System Foundation)

### 2.1 Bảng màu Chuẩn (Color Palette)

#### A. Chủ đề Mặc định — Kyoto Daylight Studio (Light Mode)
```css
:root {
  /* Canvas & Nền */
  --bg-canvas: #EFECE6;        /* Nền đá xám ấm toàn app */
  --bg-surface: #FFFFFF;       /* Nền thẻ flashcard, modal, thanh công cụ */
  --bg-subtle: #F8FAFC;        /* Nền ô ví dụ, khung phụ */
  --bg-badge-neutral: #E2E8F0; /* Nền nhãn trung tính */

  /* Mực & Chữ */
  --ink-primary: #0F172A;      /* Màu chữ chính, viền nét chính */
  --ink-secondary: #475569;    /* Màu chữ phụ, giải thích */
  --ink-tertiary: #94A3B8;     /* Chữ gợi ý, placeholder */

  /* Viền & Đổ bóng cứng */
  --border-main: 2px solid #0F172A;
  --border-subtle: 1px solid #CBD5E1;
  --shadow-sm: 2px 2px 0px #0F172A;
  --shadow-md: 4px 4px 0px #0F172A;
  --shadow-lg: 8px 8px 0px #0F172A;
  --shadow-modal: 12px 12px 0px #0F172A;
  --shadow-active: 1px 1px 0px #0F172A;

  /* Điểm nhấn & Trạng thái FSRS */
  --accent-vermilion: #E63946; /* Tem logo '日', nút Again (Quên) */
  --accent-amber: #F4A261;     /* Nút Hard (Khó) */
  --accent-pine: #2A9D8F;      /* Nút Good (Nhớ tốt), trạng thái hoàn thành */
  --accent-cobalt: #1D3557;    /* Nút Easy (Dễ), link chính */

  /* Màu nền Pastel khi Hover nút đánh giá */
  --hover-again: #FFD2D2;
  --hover-hard: #FFE8D6;
  --hover-good: #D8F3DC;
  --hover-easy: #CAF0F8;
}
```

#### B. Biến thể Mở rộng — Kyoto Night Studio (Dark Mode)
```css
[data-theme="dark"] {
  --bg-canvas: #0B1120;
  --bg-surface: #151F32;
  --bg-subtle: #1E293B;
  --bg-badge-neutral: #334155;

  --ink-primary: #F8FAFC;
  --ink-secondary: #94A3B8;
  --ink-tertiary: #64748B;

  --border-main: 2px solid #38BDF8;
  --border-subtle: 1px solid #334155;
  --shadow-sm: 2px 2px 0px #38BDF8;
  --shadow-md: 4px 4px 0px #38BDF8;
  --shadow-lg: 8px 8px 0px #38BDF8;
  --shadow-modal: 12px 12px 0px #38BDF8;
}
```

### 2.2 Typography & Cỡ chữ Tiếng Nhật

| Vai trò | Phông chữ chỉ định | Cỡ chữ | Trọng số (Weight) | Khoảng cách dòng |
| :--- | :--- | :--- | :--- | :--- |
| **Kanji Trọng tâm (Thẻ ôn tập)** | `'Noto Sans JP', sans-serif` | $4.5\text{rem} - 4.8\text{rem}$ ($72 - 76\text{px}$) | `900 (Black)` | $1.1$ |
| **Furigana / Cách đọc** | `'Noto Sans JP', sans-serif` | $1.35\text{rem} - 1.4\text{rem}$ ($22\text{px}$) | `700 (Bold)` | $1.4$ |
| **Tiêu đề UI & Số liệu** | `'Space Grotesk', sans-serif` | $1.25\text{rem} - 1.5\text{rem}$ | `700 (Bold)` | $1.2$ |
| **Nghĩa tiếng Việt & Nội dung chính** | `'Plus Jakarta Sans', sans-serif` | $1.1\text{rem} - 1.25\text{rem}$ ($18 - 20\text{px}$) | `600 (SemiBold)` | $1.5$ |
| **Câu ví dụ tiếng Nhật** | `'Noto Sans JP', sans-serif` | $1.05\text{rem} - 1.1\text{rem}$ | `700 (Bold)` | $1.8$ |
| **Nhãn phím tắt (Keycaps)** | `monospace` | $0.75\text{rem}$ ($12\text{px}$) | `700 (Bold)` | $1.0$ |

### 2.3 Bo góc (Border Radii) & Hiệu ứng Chuyển động
- **Bo góc Thẻ & Modal:** `10px` (Đủ cong để mềm mại nhưng vẫn giữ được nét vuông vức Bauhaus).
- **Bo góc Nút bấm & Ô nhập liệu:** `6px`.
- **Bo góc Nhãn (Pills/Badges):** `999px` hoặc `6px`.
- **Hiệu ứng chuyển động:**
  - Cơ học mặc định: `all 0.12s ease`.
  - Phím bấm lún: `transform: translate(2px, 2px); box-shadow: var(--shadow-active);`.
  - Khi bật `prefers-reduced-motion`: Thời gian chuyển đổi $= 0\text{s}$ (chuyển đổi tức thì).

---

## 3. Quy chuẩn Thành phần & Hành vi Giao diện

### 3.1 Thẻ Ôn tập Siêu tốc (Speed Flashcard Component)
- **Kích thước:** Chiều rộng chuẩn $640\text{px} - 800\text{px}$, chiều cao tối thiểu $400\text{px}$.
- **Hiệu ứng Lật thẻ:**
  - Nhấn `Space` hoặc click thẻ $\rightarrow$ Hiển thị tức thì Furigana, Nghĩa tiếng Việt và Ví dụ (không lật 3D tốn thời gian).
  - Hàng nút đánh giá FSRS xuất hiện ngay bên dưới.
- **Hàng 4 nút Đánh giá FSRS:**
  - **Again (Phím 1):** Màu viền đỏ chu sa, hover nền `#FFD2D2`.
  - **Hard (Phím 2):** Màu viền cam hổ phách, hover nền `#FFE8D6`.
  - **Good (Phím 3):** Màu viền xanh thông, hover nền `#D8F3DC`.
  - **Easy (Phím 4):** Màu viền xanh cobalt, hover nền `#CAF0F8`.
  - Mỗi nút có **keycap số** ở góc trên bên phải và **nhãn dự báo chu kỳ** ở bên dưới.
- **Hoàn tác (Undo):** Nhấn `Ctrl + Z` khôi phục lại thẻ trước ngay lập tức.

### 3.2 Modal Nhập liệu Tri thức Tập trung
- **Bố cục:** Căn chính giữa màn hình, chiều rộng $580\text{px}$, lớp nền mờ `rgba(15, 23, 42, 0.6)`.
- **Hộp thoại:** Viền đen `2px`, bóng đổ cứng `12px 12px 0px #0F172A`.
- **Chống mất dữ liệu:** Khi form đã có dữ liệu, nhấn `Esc` hoặc click ra ngoài sẽ bật cảnh báo xác nhận. Khi xảy ra lỗi lưu cục bộ, giữ nguyên form và hiển thị cảnh báo đỏ.

### 3.3 Khung Nhập Luyện Dịch Câu & Xử lý IME
- Ô nhập tiếng Nhật cỡ lớn, font `Noto Sans JP`, chiều cao $\ge 56\text{px}$.
- **Sự kiện phím Enter:**
  ```typescript
  if (e.nativeEvent.isComposing || e.key === 'Process') {
    return; // Đang chọn chữ Kanji, không nộp bài
  }
  if (e.key === 'Enter') {
    handleSubmitAnswer();
  }
  ```

---

## 4. Xử lý 3 Rủi ro Vật liệu Đã Được Phê Duyệt

1. **Giảm tải thị giác ở màn hình danh sách nhiều dữ liệu:**
   - Trong bảng Danh sách từ vựng/Ngữ pháp (Table view), chỉ dùng viền phân cách mỏng `1px solid #CBD5E1`.
   - Giữ viền dày `2px` và bóng đổ cứng cho hàng đang chọn (Selected row), thanh công cụ trên cùng và nút hành động.
2. **Kỷ luật sử dụng Màu Đỏ (Vermilion Discipline):**
   - Màu đỏ `#E63946` chỉ xuất hiện ở 2 vị trí: Con dấu thương hiệu `日` và nút `Again` (Quên thẻ).
   - Các nút tạo mới, lưu dữ liệu sử dụng màu xanh thông `#2A9D8F` hoặc mực đen `#0F172A` để tạo sự an tâm.
3. **Sẵn sàng cho Chế độ Ban đêm (Dark Mode Ready):**
   - Kiến trúc biến CSS đã định nghĩa sẵn biến thể `Kyoto Night Studio` để người dùng có thể kích hoạt trong màn hình Cài đặt khi học đêm.

---

## 5. Kế hoạch Triển khai (Next Implementation Steps)

1. **Bước 1 — CSS Design System:** Nhúng bảng token `Kyoto Tactile Studio` vào file stylesheet gốc của Frontend (`app/src/index.css`).
2. **Bước 2 — Áp dụng vào React Components:**
   - Cập nhật Header và thanh điều hướng chính.
   - Cập nhật màn hình Focus Review (`ReviewCard`, `RatingButtons`).
   - Cập nhật Modal tạo từ vựng (`CreateVocabModal`).
3. **Bước 3 — Kiểm thử Phím tắt & Trạng thái:** Kiểm tra toàn bộ luồng phím tắt `Space`, `1`-`4`, `Esc` trên Desktop Tauri.

---

## 6. Nghiệm thu & Khóa Tham chiếu Prototype (P4.5 Review Sign-off)

Sau quá trình kiểm toán và nhận phản hồi trực tiếp từ người dùng, bản Prototype tại thư mục `prototype/` đã được **nghiệm thu toàn diện và khóa làm mốc tham chiếu chính thức**:

### 6.1 Các hiệu chỉnh đã hoàn thiện vào mã nguồn Prototype:
1. **Căn giữa toàn diện Ví dụ câu:** Toàn bộ khối hộp `.example-box` và các dòng chữ tiếng Nhật/tiếng Việt đã được căn giữa (`margin: 24px auto 0 auto; text-align: center`).
2. **Nút bấm Hành động Kết thúc Phiên ôn:** Khi học xong thẻ cuối cùng, màn hình cung cấp sẵn nút bấm cơ học *"↺ Ôn tập lại từ đầu"* và *"🗂️ Đổi bộ thẻ khác"* để tiếp tục học mà không cần bấm Reset.
3. **Bố cục Thích ứng Màn hình Hẹp (Narrow-View):** Thêm quy chuẩn `@media (max-width: 860px)` cho phép bố cục quản lý bộ thẻ và 3 cột trạng thái tự động xếp chồng mượt mà trên màn hình nhỏ hoặc chế độ chia đôi màn hình (Split screen).
4. **Bẫy Focus Bàn phím bên trong Modal (WCAG 2.1 Focus Trap):** Khóa chu trình phím `Tab` tuần hoàn bên trong Modal, ngăn con trỏ nhảy ra ngoài nền trang web.

### 6.2 Các rủi ro được chấp nhận hoãn lại (Deferred Risks):
- **Lưu trữ CSDL cục bộ:** Hiện tại Prototype chạy trên bộ nhớ RAM; tính năng lưu vĩnh viễn vào SQLite sẽ được hoàn thành ở Phase 2 (Spring Boot backend).
- **Trí tuệ nhân tạo thực tế:** Chức năng chấm bài dịch câu hiện giả lập theo luật mẫu; kết nối trực tiếp với LLM qua Spring AI sẽ hoàn thành ở Phase 6.

**Kết luận:** Bản Prototype đạt chuẩn 100% hợp đồng tương tác và thẩm mỹ **Kyoto Tactile Studio**, sẵn sàng chuyển sang giai đoạn phát triển mã nguồn sản phẩm thực tế!
