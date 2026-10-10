# MLN122 - Web Ôn Luyện Trắc Nghiệm Kinh Tế Chính Trị Mác - Lênin

Trang web ôn luyện trắc nghiệm trực quan, hiện đại được chuyển đổi hoàn toàn từ bộ ngân hàng đề 718 câu hỏi môn **MLN122 (Kinh tế chính trị Mác - Lênin)**.

---

## 🌟 Tính Năng Nổi Bật

- **Phân chia 12 đề chuẩn (60 câu/đề)**:
  - Lấy lần lượt theo đúng thứ tự câu hỏi từ trên xuống dưới (Đề 1: Câu 1–60, Đề 2: Câu 61–120, ..., Đề 12: Câu 661–718).
  - Có chế độ ôn luyện tất cả 718 câu hỏi.
- **2 Chế độ làm bài**:
  - **Luyện tập (Practice)**: Chọn đáp án là hiển thị phản hồi Đúng/Sai ngay lập tức kèm giải thích đáp án chuẩn.
  - **Thi thử (Exam)**: Đếm ngược 60 phút, ẩn đáp án cho đến khi nộp bài, tính điểm % và đánh giá năng lực.
- **Bảng câu hỏi nhanh (Palette Grid 1..60)**:
  - Hiển thị trực quan câu đã làm (xanh dương), chưa làm (xám), gắn cờ (vàng). Nhấp để nhảy ngay đến câu mong muốn.
- **Tra cứu nhanh 718 câu hỏi**:
  - Công cụ tìm kiếm tức thì theo từ khóa (VD: *giá trị thặng dư*, *tư bản*, *độc quyền*...) và chuyển thẳng tới câu hỏi.
- **Hỗ trợ phím tắt**:
  - `←` `→`: Chuyển câu trước / câu sau.
  - `1` `2` `3` `4` hoặc `A` `B` `C` `D`: Chọn đáp án nhanh.
  - `F`: Gắn cờ xem lại.
- **Giao diện hiện đại**:
  - Hỗ trợ chế độ Sáng / Tối (Light / Dark Mode).
  - Responsive tối ưu cho cả máy tính, tablet và điện thoại di động.
  - Lưu tiến độ học tập vào trình duyệt (không lo mất bài khi tải lại trang).

---

## 🚀 Hướng Dẫn Đẩy Lên GitHub & Bật GitHub Pages

Chỉ cần 3 bước đơn giản là bạn có thể đưa web lên GitHub và chạy online miễn phí:

### Bước 1: Khởi tạo Git trong thư mục này
Mở Terminal / Command Prompt tại thư mục `mln122-quiz-app` và chạy:

```bash
git init
git add .
git commit -m "Khoi tao web on tap MLN122 voi 12 de 60 cau"
git branch -M main
```

### Bước 2: Tạo repository mới trên GitHub và Push code lên
1. Vào [GitHub.com](https://github.com) -> Tạo **New repository** (đặt tên ví dụ: `mln122-quiz`).
2. Chạy lệnh liên kết và đẩy code lên:

```bash
git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/mln122-quiz.git
git push -u origin main
```

### Bước 3: Kích hoạt GitHub Pages để sử dụng online
1. Trên trang repo GitHub của bạn, vào **Settings** -> mục **Pages** (ở cột bên trái).
2. Tại phần **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`.
   - **Branch**: Chọn `main` và thư mục `/ (root)`.
   - Nhấn **Save**.
3. Sau khoảng 1-2 phút, GitHub sẽ cung cấp đường link website online của bạn:
   `https://TÊN_GITHUB_CỦA_BẠN.github.io/mln122-quiz/`

---

## 💻 Chạy Trực Tiếp Offline Trên Máy Tính

Không cần cài đặt bất kỳ phần mềm hay server nào:
- Chỉ cần **nhấp đúp chuột vào file `index.html`** để mở ngay trên trình duyệt (Chrome, Edge, Cốc Cốc, Safari...).
