# Quy tắc Git (Git Rules)

## 1. Phân nhánh (Branching)
- **`main`**: Nhánh chứa code ổn định (Production-ready). Không commit trực tiếp vào đây.
- **`dev`**: Nhánh integration chính. Chứa code đang phát triển.
- **`feature/tên-tính-năng`**: Nhánh để phát triển chức năng mới. Tách từ `dev` và sẽ được Merge (qua Pull Request) trở lại `dev`.
- **`bugfix/tên-lỗi`**: Nhánh sửa lỗi phát sinh.

## 2. Chuẩn mực Commit (Conventional Commits)
Sử dụng cấu trúc: `<type>(<tính năng>): <nội dung commit>`

- `feat(tính năng): ...` -> Thêm tính năng mới.
- `fix(tính năng): ...` -> Sửa lỗi của tính năng đó.
- `docs(tính năng): ...` -> Cập nhật tài liệu (Ví dụ: `docs(prd): cập nhật tính năng FSRS`).
- `chore(tính năng): ...` -> Cấu hình, update thư viện, build tools.
- `refactor(tính năng): ...` -> Cải thiện cấu trúc code nhưng không thay đổi chức năng.
- `style(tính năng): ...` -> Thay đổi format, không ảnh hưởng logic.
- `test(tính năng): ...` -> Cập nhật Unit/Integration Test.

> LƯU Ý: Tất cả commit message (bao gồm type, scope, subject) BẮT BUỘC phải được viết bằng TIẾNG ANH.
