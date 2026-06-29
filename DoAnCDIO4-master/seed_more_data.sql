-- ====================================================================
-- SQL Script: Thêm dữ liệu mẫu mở rộng cho hệ thống Quản lý Heritage Coffee
-- Sử dụng: Copy toàn bộ nội dung này và paste vào mục "SQL Editor" trên Supabase Dashboard.
-- ====================================================================

-- 1. Bổ sung các Danh mục mới (Nếu chưa có)
INSERT INTO danhmuc (DanhMucID, TenDanhMuc, MoTa) VALUES
(4, 'Đá Xay & Sinh Tố', 'Thức uống xay với đá viên và kem béo ngậy'),
(5, 'Nước Ép Trái Cây', 'Nước ép hoa quả nguyên chất tự nhiên tươi ngon')
ON CONFLICT (DanhMucID) DO UPDATE SET 
    TenDanhMuc = EXCLUDED.TenDanhMuc,
    MoTa = EXCLUDED.MoTa;

-- 2. Bổ sung các Sản phẩm mới
INSERT INTO sanpham (SanPhamID, DanhMucID, TenSanPham, MoTa, HinhAnh, ConBan, NoiBat) VALUES
(8, 1, 'CÀ PHÊ MUỐI XỨ HUẾ', 'Cà phê phin kết hợp lớp kem mặn béo ngậy đậm đà.', 'fa-mug-hot', TRUE, TRUE),
(9, 4, 'MATCHA ĐÁ XAY', 'Bột matcha Nhật Bản hòa quyện cùng sữa tươi và kem whipping.', 'fa-ice-cream', TRUE, TRUE),
(10, 4, 'SINH TỐ XOÀI DỪA', 'Xoài cát chín ngọt thơm kết hợp nước cốt dừa béo ngậy.', 'fa-blender', TRUE, FALSE),
(11, 5, 'NƯỚC ÉP CAM VÀNG', 'Cam sành nguyên chất vắt tay giàu Vitamin C tươi mát.', 'fa-glass-water', TRUE, FALSE),
(12, 5, 'NƯỚC ÉP DƯA HẤU ĐỎ', 'Nước ép dưa hấu ngọt thanh tự nhiên giải nhiệt hiệu quả.', 'fa-glass-water', TRUE, FALSE),
(13, 3, 'CHEESECAKE CHANH LEO', 'Bánh mousse phô mai chua ngọt ngậy mịn quyến rũ.', 'fa-cake-candles', TRUE, TRUE)
ON CONFLICT (SanPhamID) DO UPDATE SET 
    TenSanPham = EXCLUDED.TenSanPham,
    DanhMucID = EXCLUDED.DanhMucID,
    MoTa = EXCLUDED.MoTa,
    HinhAnh = EXCLUDED.HinhAnh,
    ConBan = EXCLUDED.ConBan,
    NoiBat = EXCLUDED.NoiBat;

-- 3. Cấu hình Giá bán & Size cho các sản phẩm mới
INSERT INTO sanphamsize (SanPhamSizeID, SanPhamID, KichThuoc, Gia, Calories) VALUES
-- Cà phê muối (ID 8)
(18, 8, 'S', 32000, 190), (19, 8, 'M', 37000, 240), (20, 8, 'L', 42000, 290),
-- Matcha đá xay (ID 9)
(21, 9, 'S', 45000, 310), (22, 9, 'M', 50000, 360), (23, 9, 'L', 55000, 410),
-- Sinh tố xoài dừa (ID 10)
(24, 10, 'S', 40000, 280), (25, 10, 'M', 45000, 330), (26, 10, 'L', 50000, 380),
-- Nước ép cam (ID 11)
(27, 11, 'S', 35000, 120), (28, 11, 'M', 40000, 160), (29, 11, 'L', 45000, 200),
-- Nước ép dưa hấu (ID 12)
(30, 12, 'S', 30000, 100), (31, 12, 'M', 35000, 130), (32, 12, 'L', 40000, 170),
-- Cheesecake chanh leo (ID 13) (Bánh thường chỉ có 1 size duy nhất)
(33, 13, 'S', 45000, 380)
ON CONFLICT (SanPhamSizeID) DO UPDATE SET 
    Gia = EXCLUDED.Gia,
    Calories = EXCLUDED.Calories;

-- 4. Bổ sung Topping mới
INSERT INTO topping (ToppingID, TenTopping, Gia) VALUES
(3, 'Thạch trái cây hỗn hợp', 7000),
(4, 'Hạt chia hữu cơ', 5000),
(5, 'Thạch cà phê tự làm', 8000)
ON CONFLICT (ToppingID) DO UPDATE SET 
    TenTopping = EXCLUDED.TenTopping,
    Gia = EXCLUDED.Gia;

-- Đăng ký topping được phép dùng với các sản phẩm
INSERT INTO sanphamtopping (SanPhamID, ToppingID) VALUES
(8, 2), (8, 5),             -- Cà phê muối kết hợp kem mặn hoặc thạch cafe
(9, 1), (9, 2), (9, 3),      -- Matcha đá xay hợp trân châu, kem béo hoặc thạch trái cây
(10, 3), (10, 4),            -- Sinh tố xoài dừa hợp thạch trái cây, hạt chia
(11, 4), (12, 4)             -- Các loại nước ép trái cây hợp hạt chia
ON CONFLICT DO NOTHING;

-- 5. Tạo thêm Người Dùng (Khách hàng & Nhân viên phục vụ/pha chế) để kiểm thử phân quyền
INSERT INTO nguoidung (NguoiDungID, VaiTroID, HoTen, TenDangNhap, Email, SoDienThoai, MatKhau, TongDiem, HangThanhVienID, TrangThai) VALUES
(3, 6, 'Lê Thị Thu', 'lethu99', 'lethu99@gmail.com', '0912345678', '123', 600, 1, 'HoatDong'),
(4, 6, 'Phạm Hoàng Nam', 'namhoang', 'namhoang@gmail.com', '0933445566', '123', 2500, 2, 'HoatDong'),
(5, 6, 'Trần Minh Quân', 'quanminh', 'quanminh@gmail.com', '0966778899', '123', 5500, 3, 'HoatDong'),
(6, 6, 'Vũ Hải Đăng (Bị Khóa)', 'haidang_locked', 'danghaiv@gmail.com', '0977889900', '123', 150, 1, 'BiKhoa'),
(7, 4, 'Trần Văn Pha Che', 'barista1', 'barista1@coffee.com', '0901234567', 'admin123', 0, 1, 'HoatDong'),
(8, 3, 'Nguyễn Thu Ngân', 'cashier1', 'cashier1@coffee.com', '0907654321', 'admin123', 0, 1, 'HoatDong')
ON CONFLICT (TenDangNhap) DO UPDATE SET 
    HoTen = EXCLUDED.HoTen,
    Email = EXCLUDED.Email,
    SoDienThoai = EXCLUDED.SoDienThoai,
    MatKhau = EXCLUDED.MatKhau,
    TongDiem = EXCLUDED.TongDiem,
    HangThanhVienID = EXCLUDED.HangThanhVienID,
    TrangThai = EXCLUDED.TrangThai;

-- 6. Thêm Voucher mẫu
INSERT INTO voucher (VoucherID, MaVoucher, TenVoucher, LoaiGiamGia, GiaTriGiam, GiaTriGiamToiDa, DonHangToiThieu, SoLuong, SoLanDungToiDa, TrangThai) VALUES
(2, 'CHAOHERITAGE', 'Mã Chào mừng giảm 20%', 'PhanTram', 20.00, 30000.00, 50000.00, 500, 1, 'HoatDong'),
(3, 'VIPDIAMOND', 'Giảm 50K cho đơn hàng lớn', 'TienMat', 50000.00, 50000.00, 150000.00, 100, 1, 'HoatDong'),
(4, 'UUDAICUOITUAN', 'Cuối tuần rực rỡ giảm 15K', 'TienMat', 15000.00, 15000.00, 40000.00, 0, 1, 'HetHan') -- Voucher hết hạn
ON CONFLICT (VoucherID) DO UPDATE SET 
    MaVoucher = EXCLUDED.MaVoucher,
    TenVoucher = EXCLUDED.TenVoucher,
    LoaiGiamGia = EXCLUDED.LoaiGiamGia,
    GiaTriGiam = EXCLUDED.GiaTriGiam,
    GiaTriGiamToiDa = EXCLUDED.GiaTriGiamToiDa,
    DonHangToiThieu = EXCLUDED.DonHangToiThieu,
    SoLuong = EXCLUDED.SoLuong,
    TrangThai = EXCLUDED.TrangThai;

-- 7. Tạo danh sách Đơn Hàng mẫu đa dạng trạng thái để kiểm thử bộ lọc thống kê & quản lý
INSERT INTO donhang (DonHangID, MaDonHang, KhachHangID, NhanVienID, BanID, TongTien, GiamGia, ThanhTien, DiemCongThem, DiemSuDung, PhuongThucThanhToan, TrangThai, GhiChu, VoucherID, LoaiDonHangID, NgayTao) VALUES
-- Khách 3 (Lê Thị Thu) đặt online mang đi (Hoàn thành)
(1003, '#DH1003', 3, 8, NULL, 95000.00, 10000.00, 85000.00, 8, 0, 'Momo', 'HoanThanh', 'Ít ngọt nhiều đá', 2, 2, NOW() - INTERVAL '3 days'),
-- Khách 4 (Phạm Hoàng Nam) đặt tại bàn số 3 (Đang pha chế)
(1004, '#DH1004', 4, 8, 3, 117000.00, 5850.00, 111150.00, 11, 0, 'TienMat', 'DangPhaChe', 'Bánh nướng nóng', NULL, 1, NOW() - INTERVAL '2 hours'),
-- Khách 5 (Trần Minh Quân) đặt giao hàng tận nơi (Đang giao hàng)
(1005, '#DH1005', 5, 8, NULL, 230000.00, 50000.00, 180000.00, 18, 0, 'ChuyenKhoan', 'DangGiao', 'Giao sảnh chung cư A', 3, 3, NOW() - INTERVAL '1 hours'),
-- Khách vãng lai đặt tại quầy (Hoàn thành)
(1006, '#DH1006', NULL, 8, NULL, 62000.00, 0.00, 62000.00, 0, 0, 'TienMat', 'HoanThanh', 'Không lấy ống hút', NULL, 2, NOW() - INTERVAL '1 days'),
-- Khách 3 (Lê Thị Thu) đặt giao hàng (Chờ xác nhận duyệt)
(1007, '#DH1007', 3, NULL, NULL, 82000.00, 0.00, 82000.00, 8, 0, 'Momo', 'ChoXacNhan', 'Giao nhanh trước 7h tối', NULL, 3, NOW() - INTERVAL '10 minutes'),
-- Khách 4 đặt tại bàn số 2 (Đã hủy đơn)
(1008, '#DH1008', 4, 8, 2, 45000.00, 0.00, 45000.00, 0, 0, 'TienMat', 'DaHuy', 'Khách đổi ý đặt món khác', NULL, 1, NOW() - INTERVAL '4 days')
ON CONFLICT (DonHangID) DO UPDATE SET 
    MaDonHang = EXCLUDED.MaDonHang,
    KhachHangID = EXCLUDED.KhachHangID,
    NhanVienID = EXCLUDED.NhanVienID,
    BanID = EXCLUDED.BanID,
    TongTien = EXCLUDED.TongTien,
    GiamGia = EXCLUDED.GiamGia,
    ThanhTien = EXCLUDED.ThanhTien,
    TrangThai = EXCLUDED.TrangThai,
    NgayTao = EXCLUDED.NgayTao;

-- 8. Chi Tiết Đơn Hàng cho các đơn mới tạo
INSERT INTO chitietdonhang (ChiTietDonHangID, DonHangID, SanPhamSizeID, SoLuong, DonGia, ThanhTien, TrangThai) VALUES
-- Đơn DH1003: Cà phê muối size M (ID 19 = 37000) x 1 + Trà vải thiều size L (ID 16 = 55000) x 1. Topping: Trân châu (ID 1 = 5000) x 1. Tổng: 97,000 đ
(5, 1003, 19, 1, 37000.00, 37000.00, 'HoanThanh'),
(6, 1003, 16, 1, 55000.00, 55000.00, 'HoanThanh'),
-- Đơn DH1004: Matcha đá xay size L (ID 23 = 55000) x 2. Topping: Trân châu (ID 1 = 5000) x 1 + Kem Macchiato (ID 2 = 10000) x 1. Tổng: 125,000 đ
(7, 1004, 23, 2, 55000.00, 110000.00, 'DangPhaChe'),
-- Đơn DH1005: Cheesecake chanh leo (ID 33 = 45000) x 2 + Bạc xỉu size L (ID 6 = 40000) x 2 + Nước ép dưa hấu size M (ID 31 = 35000) x 2. Tổng: 240,000 đ
(8, 1005, 33, 2, 45000.00, 90000.00, 'HoanThanh'),
(9, 1005, 6, 2, 40000.00, 80000.00, 'HoanThanh'),
(10, 1005, 31, 2, 35000.00, 70000.00, 'HoanThanh'),
-- Đơn DH1006: Sinh tố xoài dừa size S (ID 24 = 40000) x 1 + Cà phê đen size M (ID 2 = 30000) x 1. Tổng: 70,000 đ
(11, 1006, 24, 1, 40000.00, 40000.00, 'HoanThanh'),
(12, 1006, 2, 1, 30000.00, 30000.00, 'HoanThanh'),
-- Đơn DH1007: Cà phê muối size S (ID 18 = 32000) x 1 + Nước ép cam size M (ID 28 = 40000) x 1 + Thạch cafe (ID 5 = 8000) x 1. Tổng: 80,000 đ
(13, 1007, 18, 1, 32000.00, 32000.00, 'ChoPhaChe'),
(14, 1007, 28, 1, 40000.00, 40000.00, 'ChoPhaChe'),
-- Đơn DH1008: Cheesecake chanh leo (ID 33 = 45000) x 1. Tổng: 45,000 đ
(15, 1008, 33, 1, 45000.00, 45000.00, 'DaGiao')
ON CONFLICT (ChiTietDonHangID) DO UPDATE SET 
    DonHangID = EXCLUDED.DonHangID,
    SanPhamSizeID = EXCLUDED.SanPhamSizeID,
    SoLuong = EXCLUDED.SoLuong,
    DonGia = EXCLUDED.DonGia,
    ThanhTien = EXCLUDED.ThanhTien,
    TrangThai = EXCLUDED.TrangThai;

-- Đăng ký topping đi kèm với chi tiết đơn
INSERT INTO chitiettopping (ChiTietDonHangID, ToppingID) VALUES
(5, 1), -- Đơn 1003 dùng thêm Trân châu đen
(7, 1), (7, 2) -- Đơn 1004 dùng Trân châu đen + Kem Macchiato
ON CONFLICT DO NOTHING;

-- 9. Thêm các Đánh Giá mẫu từ Khách hàng
-- LƯU Ý: SanPhamID phải trỏ tới bảng sanpham (ví dụ: 8, 13, 1), KHÔNG phải SanPhamSizeID (19, 33)
INSERT INTO danhgia (DanhGiaID, KhachHangID, SanPhamID, DonHangID, SoSao, BinhLuan) VALUES
(1, 3, 8, 1003, 5, 'Cà phê muối hương vị rất đậm đà, kem mặn ngậy vừa phải. Sẽ gọi lại!'),
(2, 5, 13, 1005, 5, 'Bánh phô mai chanh leo rất thơm và mịn, nước ép thì tươi nguyên chất.'),
(3, 1, 1, 1001, 4, 'Cà phê đen truyền thống khá mạnh, thích hợp cho ai mê vị đắng nguyên bản.')
ON CONFLICT (DanhGiaID) DO UPDATE SET 
    SoSao = EXCLUDED.SoSao,
    BinhLuan = EXCLUDED.BinhLuan;

-- 10. Thêm dữ liệu Đặt Bàn (Booking)
INSERT INTO datban (DatBanID, KhachHangID, BanID, ThoiGianDat, SoNguoi, GhiChu, TrangThai) VALUES
(1, 3, 1, NOW() + INTERVAL '1 days 2 hours', 2, 'Đặt bàn cạnh cửa sổ', 'ChoXacNhan'),
(2, 4, 3, NOW() + INTERVAL '3 hours', 4, 'Tổ chức sinh nhật nhỏ', 'DaXacNhan'),
(3, 5, 5, NOW() + INTERVAL '2 days', 6, 'Khách VIP họp phòng riêng', 'DaXacNhan'),
(4, 1, 2, NOW() - INTERVAL '1 days', 2, 'Cần yên tĩnh học tập', 'HoanThanh'),
(5, 3, 4, NOW() + INTERVAL '1 days', 4, 'Huỷ bàn do bận việc đột xuất', 'DaHuy')
ON CONFLICT (DatBanID) DO UPDATE SET 
    ThoiGianDat = EXCLUDED.ThoiGianDat,
    SoNguoi = EXCLUDED.SoNguoi,
    GhiChu = EXCLUDED.GhiChu,
    TrangThai = EXCLUDED.TrangThai;

-- ====================================================================
-- Hoàn tất dữ liệu mẫu. Hệ thống của bạn giờ đã sẵn sàng kiểm thử đầy đủ các chức năng!
-- ====================================================================
