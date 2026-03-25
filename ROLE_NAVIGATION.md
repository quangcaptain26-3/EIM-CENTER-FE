# Phân quyền và Chuyển hướng theo Role

## 1. Phần "Tổng quan" (Breadcrumb/Header)

- **"Tổng quan"** = Trang Dashboard (`/dashboard`), hiển thị ở header khi đang xem trang tổng quan.
- Nếu route hiện tại không match metadata → fallback hiển thị "Tổng quan" (tránh header trống).

---

## 2. Redirect sau đăng nhập và khi vào `/`

| Role       | Trang chuyển tới      | Đường dẫn             |
|-----------|------------------------|------------------------|
| **SALES** | Tuyển sinh (học thử)   | `/trials`              |
| **ACCOUNTANT** | Hóa đơn          | `/finance/invoices`    |
| **TEACHER**    | Buổi học của tôi  | `/my-sessions`         |
| **ROOT, DIRECTOR, ACADEMIC** | Tổng quan | `/dashboard` |

---

## 3. Menu Sidebar theo Role

| Module        | ROOT | DIRECTOR | ACADEMIC | SALES | ACCOUNTANT | TEACHER |
|---------------|------|----------|----------|-------|------------|---------|
| Tổng quan     | ✓    | ✓        | ✓        | ✓     | ✓          | ✓       |
| Chương trình học | ✓  | ✓        | ✓        | ✓     | ✓          | ✓       |
| Học viên      | ✓    | ✓        | ✓        | ✓     | ✓          | -       |
| Quản lý lớp học | ✓   | ✓        | ✓        | -     | -          | -       |
| Quản lý buổi học | ✓  | ✓        | ✓        | -     | -          | -       |
| Buổi học của tôi | -   | -        | -        | -     | -          | ✓       |
| Tuyển sinh    | ✓    | ✓        | ✓        | ✓     | -          | -       |
| Tài chính     | ✓    | ✓        | ✓        | -     | ✓          | -       |
| Hệ thống > Thông báo | ✓ | ✓        | ✓        | ✓     | ✓          | ✓       |
| Hệ thống > Nhật ký | ✓  | ✓        | -        | -     | -          | -       |
| Hệ thống > Quản lý người dùng | ✓ | - | -      | -     | -          | -       |

---

## 4. Redirect đường dẫn cha (tránh 404)

| URL gõ/bookmark | Chuyển tới                  |
|-----------------|-----------------------------|
| `/finance`      | `/finance/invoices`         |
| `/curriculum`   | `/curriculum/programs`      |
| `/system`       | `/notifications`            |

---

## 5. Xử lý 403 (API trả không có quyền)

- Interceptor axios bắt 403 → redirect `/forbidden`.
- **RoleGuard** chặn truy cập route theo role → redirect `/forbidden` trước khi gọi API.

---

## File cấu hình liên quan

- `src/app/router/route-meta.ts` – metadata route, `allowedRoles`
- `src/app/router/default-redirect.rule.ts` – quy tắc redirect theo role
- `src/app/router/index.tsx` – RoleGuard cho từng route
- `src/presentation/components/layout/sidebar-menu.config.ts` – lọc menu theo role
