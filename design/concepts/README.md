# Đánh giá & So sánh 3 Hướng Thiết kế Giao diện (P4.2 Concepts)
> **Dự án:** NihongoAI (Japanese Learning Desktop App)  
> **Tham chiếu hợp đồng:** `docs/product-design-brief.md` (P4.1)  
> **Mục tiêu:** Cung cấp 3 hướng thiết kế trực quan khác biệt để người dùng đánh giá và lựa chọn trước khi xây dựng Prototype hoàn chỉnh.

---

## 1. Tổng quan & Hợp đồng Tương tác Chung (Shared Interaction Contract)

Cả 3 hướng thiết kế đều tuân thủ **cùng một hợp đồng tương tác** đã được phê duyệt ở P4.1:
1. **Khởi động không đăng nhập (Local-first):** Mở app trực tiếp vào không gian học tập, thanh trạng thái hàng đợi hôm nay (Mới, Đang học, Cần ôn).
2. **Ôn tập Flashcard FSRS (Focus Mode):**
   - Mặt trước chỉ hiện câu hỏi.
   - Thao tác lật thẻ bằng chuột hoặc phím `Space` / `Enter`.
   - Mặt sau hiển thị Furigana, nghĩa tiếng Việt, câu ví dụ và 4 nút đánh giá (`Again`, `Hard`, `Good`, `Easy`) kèm nhãn dự báo chu kỳ thời gian.
   - Tự động chuyển thẻ ngay sau khi chọn mức đánh giá.
   - Hỗ trợ phím tắt số `1`, `2`, `3`, `4`.
3. **Modal Tạo/Sửa Tri thức tập trung:** Căn giữa màn hình, đầy đủ trường dữ liệu (Word, Reading, Meaning, JLPT level), phím `Esc` để đóng, kiểm tra validation không mất dữ liệu.
4. **Typography Tiếng Nhật:** Hiển thị sắc nét chữ Hán (Kanji), phân tách nét rõ ràng, cỡ chữ tối thiểu $\ge 40\text{px}$ cho thẻ học.

---

## 2. So sánh Chi tiết 3 Hướng Thiết kế

### Direction A: Wabi-Sabi Zen Editorial (Thanh lịch & Điềm tĩnh)
- **Tập tin mẫu:** [`design/concepts/concept-a-zen-editorial.html`](file:///d:/code/canhan/nihongoAI/design/concepts/concept-a-zen-editorial.html)
- **Bảng màu:** Nền giấy Washi ngà ấm (`#FAF8F5`), mực in Sumi đen mềm (`#1C1A17`), đỏ chu sa (*Vermilion* `#C23B22`), xanh Matcha (`#2E5A44`).
- **Typography:** Serif tiếng Nhật cổ điển (`Shippori Mincho`, `Noto Serif JP`) kết hợp Sans-serif hiện đại (`Outfit`).
- **Lý do thiết kế (Rationale):** Tái hiện cảm giác của một cuốn sách in truyền thống hoặc bản thư pháp Nhật Bản. Giúp mắt người học thư giãn tối đa trong các phiên ôn tập kéo dài (100–200 thẻ liên tục), tạo cảm giác tĩnh tâm và tập trung cao độ.
- **Rủi ro tương tác (Interaction Risks):** Viền mảnh 1px thanh lịch có thể hơi khó nhìn trên màn hình có độ sáng cao ngoài trời nếu không có viền Focus rõ ràng.

---

### Direction B: Tokyo Neo-Dark Glass (Hiện đại, Công nghệ cao & Đầy năng lượng)
- **Tập tin mẫu:** [`design/concepts/concept-b-tokyo-dark.html`](file:///d:/code/canhan/nihongoAI/design/concepts/concept-b-tokyo-dark.html)
- **Bảng màu:** Nền không gian sâu thẳm (`#07090E`, `#101422`), thẻ kính mờ Frosted Glass (`rgba(18, 22, 34, 0.75)` với `backdrop-filter: blur(24px)`), dải màu phát quang Neon (Sakura Pink `#FF3B69`, Cyber Cyan `#00F0FF`, Lime `#00FF9D`, Amber `#FFB703`).
- **Typography:** Sans-serif hình học công nghệ (`Plus Jakarta Sans`) kết hợp nét Kanji đậm sắc nét (`Noto Sans JP`).
- **Lý do thiết kế (Rationale):** Tạo cảm giác như đang sử dụng một công cụ năng suất cao cấp (giống Linear, Raycast hay Superhuman). Rất hấp dẫn với đối tượng người học trẻ, lập trình viên, hoặc người thích chế độ Dark Mode khi học đêm.
- **Rủi ro tương tác (Interaction Risks):** Hiệu ứng phát quang neon nếu lạm dụng có thể làm phân tán sự chú ý khỏi chữ Kanji; cần giữ độ sáng đèn nền vừa phải để tránh mỏi mắt.

---

### Direction C: Kyoto Tactile Studio (Bauhaus Craft, Vật lý & Tương phản Tuyệt đối)
- **Tập tin mẫu:** [`design/concepts/concept-c-kyoto-studio.html`](file:///d:/code/canhan/nihongoAI/design/concepts/concept-c-kyoto-studio.html)
- **Bảng màu:** Nền đá xám ấm (`#EFECE6`), mực đen sâu (`#0F172A`), viền mực 2px sắc sảo, bóng đổ cứng đậm nét (*Hard Offset Shadows* `4px 4px 0px #0F172A`), điểm xuyết đỏ sơn mài và cam đất.
- **Typography:** Phông chữ Grotesk công nghiệp (`Space Grotesk`) kết hợp chữ Kanji siêu đậm nét (*Heavy Black Weight* `Noto Sans JP`).
- **Lý do thiết kế (Rationale):** Tính công thái học và độ nhận biết tương tác đạt mức tối đa (chuẩn Accessibility AAA). Nút bấm có hiệu ứng lún cơ học chân thực khi click (`active: translate(2px, 2px)`). Không có bất kỳ sự mơ hồ nào về vùng bấm hay trạng thái thẻ.
- **Rủi ro tương tác (Interaction Risks):** Phong cách có phần thô ráp (Brutalist) có thể mang lại cảm giác hơi cứng nhắc đối với người thích sự mềm mại, thơ mộng của tiếng Nhật.

---

## 3. Ma trận So sánh Tổng hợp

| Tiêu chí đánh giá | Direction A (Zen Editorial) | Direction B (Tokyo Dark Glass) | Direction C (Kyoto Studio) |
| :--- | :--- | :--- | :--- |
| **Cảm xúc chủ đạo** | Thư thái, thanh tao, sách vở | Hiện đại, sắc bén, năng động | Vững chãi, vật lý, rõ ràng |
| **Môi trường phù hợp** | Học ban ngày, phòng đọc | Học ban đêm, bàn làm việc tech | Mọi điều kiện ánh sáng |
| **Độ rõ nét Kanji** | Rất cao (Thư pháp Serif) | Cực cao (Glow/Sans tương phản) | Tuyệt đối (Đậm nét AAA) |
| **Mức độ gây mỏi mắt** | Thấp nhất | Thấp (khi ở Dark mode) | Trung bình |
| **Phản hồi tương tác** | Nhẹ nhàng, mượt mà | Phát sáng, viền neon | Cơ học, lún nút bấm dứt khoát |

---

## 4. Hướng dẫn Người dùng Lựa chọn (Human Decision Gate)

Bạn có thể mở trực tiếp 3 file HTML trên bằng bất kỳ trình duyệt nào để trải nghiệm bấm lật thẻ và gõ phím `Space`, `1`, `2`, `3`, `4`:
1. Mở [`design/concepts/concept-a-zen-editorial.html`](file:///d:/code/canhan/nihongoAI/design/concepts/concept-a-zen-editorial.html)
2. Mở [`design/concepts/concept-b-tokyo-dark.html`](file:///d:/code/canhan/nihongoAI/design/concepts/concept-b-tokyo-dark.html)
3. Mở [`design/concepts/concept-c-kyoto-studio.html`](file:///d:/code/canhan/nihongoAI/design/concepts/concept-c-kyoto-studio.html)

**Xin hãy đưa ra quyết định của bạn:** Bạn chọn hướng thiết kế nào (**Direction A**, **Direction B**, hay **Direction C**), hoặc bạn có muốn kết hợp yếu tố nào giữa các hướng trước khi bước vào giai đoạn Prototype?
