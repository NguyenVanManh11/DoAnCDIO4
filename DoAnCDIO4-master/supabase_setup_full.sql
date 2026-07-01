-- Supabase / PostgreSQL Setup Script for Coffee Shop Management System (FULL VERSION)
-- Includes all schema tables and extensive seed data.

-- ==========================================
-- 1. ENUMS (Custom Types)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_ban') THEN
        CREATE TYPE trang_thai_ban AS ENUM ('Trong', 'DangDung', 'DaDat', 'BaoTri');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_dat_ban') THEN
        CREATE TYPE trang_thai_dat_ban AS ENUM ('ChoXacNhan', 'DaXacNhan', 'DaHuy', 'HoanThanh');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_don_hang') THEN
        CREATE TYPE trang_thai_don_hang AS ENUM ('ChoXacNhan', 'DangPhaChe', 'DangGiao', 'HoanThanh', 'DaHuy');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_chi_tiet_don_hang') THEN
        CREATE TYPE trang_thai_chi_tiet_don_hang AS ENUM ('ChoPhaChe', 'DangPhaChe', 'HoanThanh', 'DaGiao');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loai_hanh_vi') THEN
        CREATE TYPE loai_hanh_vi AS ENUM ('XemSanPham', 'ThemGioHang', 'DatHang', 'DanhGia', 'TimKiem');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_nguoi_dung') THEN
        CREATE TYPE trang_thai_nguoi_dung AS ENUM ('HoatDong', 'BiKhoa', 'TamNgung');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loai_thao_tac_kho') THEN
        CREATE TYPE loai_thao_tac_kho AS ENUM ('NhapKho', 'XuatKho', 'Huy', 'KiemKe');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_thanh_toan') THEN
        CREATE TYPE trang_thai_thanh_toan AS ENUM ('ChoThanhToan', 'DaThanhToan', 'ThatBai', 'HoanTien');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_voucher') THEN
        CREATE TYPE trang_thai_voucher AS ENUM ('HoatDong', 'TamDung', 'HetHan');
    END IF;
END $$;

-- ==========================================
-- 2. SCHEMA DEFINITIONS (TABLES)
-- ==========================================

-- Bảng Vai Trò (vaitro)
CREATE TABLE IF NOT EXISTS vaitro (
    VaiTroID SERIAL PRIMARY KEY,
    TenVaiTro VARCHAR(50) UNIQUE NOT NULL,
    MoTa VARCHAR(255)
);

-- Bảng Hạng Thành Viên (hangthanhvien)
CREATE TABLE IF NOT EXISTS hangthanhvien (
    HangThanhVienID SERIAL PRIMARY KEY,
    TenHang VARCHAR(50) UNIQUE,
    DiemToiThieu INT DEFAULT 0,
    PhanTramGiam DECIMAL(5,2) DEFAULT 0.00
);

-- Bảng Người Dùng (nguoidung)
CREATE TABLE IF NOT EXISTS nguoidung (
    NguoiDungID SERIAL PRIMARY KEY,
    VaiTroID INT REFERENCES vaitro(VaiTroID) DEFAULT 6,
    HoTen VARCHAR(100) NOT NULL,
    TenDangNhap VARCHAR(50) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    SoDienThoai VARCHAR(20) UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    AnhDaiDien VARCHAR(255),
    GioiTinh VARCHAR(10),
    NgaySinh DATE,
    DiaChi TEXT,
    TrangThai VARCHAR(20) DEFAULT 'HoatDong',
    TongDiem INT DEFAULT 0,
    HangThanhVienID INT REFERENCES hangthanhvien(HangThanhVienID) DEFAULT 1,
    DaXoa BOOLEAN DEFAULT FALSE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Bàn (ban)
CREATE TABLE IF NOT EXISTS ban (
    BanID SERIAL PRIMARY KEY,
    TenBan VARCHAR(50) NOT NULL,
    SucChua INT NOT NULL,
    QRCode VARCHAR(255),
    TrangThai VARCHAR(20) DEFAULT 'Trong',
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Ca Làm Việc (calamviec)
CREATE TABLE IF NOT EXISTS calamviec (
    CaLamViecID SERIAL PRIMARY KEY,
    TenCa VARCHAR(50),
    GioBatDau TIME,
    GioKetThuc TIME,
    MoTa TEXT
);

-- Bảng Danh Mục (danhmuc)
CREATE TABLE IF NOT EXISTS danhmuc (
    DanhMucID SERIAL PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL,
    MoTa TEXT,
    DaXoa BOOLEAN DEFAULT FALSE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Sản Phẩm (sanpham)
CREATE TABLE IF NOT EXISTS sanpham (
    SanPhamID SERIAL PRIMARY KEY,
    DanhMucID INT REFERENCES danhmuc(DanhMucID),
    TenSanPham VARCHAR(150) NOT NULL,
    MoTa TEXT,
    HinhAnh VARCHAR(255),
    ConBan BOOLEAN DEFAULT TRUE,
    NoiBat BOOLEAN DEFAULT FALSE,
    DaXoa BOOLEAN DEFAULT FALSE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Size Sản Phẩm (sanphamsize)
CREATE TABLE IF NOT EXISTS sanphamsize (
    SanPhamSizeID SERIAL PRIMARY KEY,
    SanPhamID INT REFERENCES sanpham(SanPhamID) ON DELETE CASCADE,
    KichThuoc VARCHAR(5) CHECK (KichThuoc IN ('S', 'M', 'L')),
    Gia DECIMAL(10,2) NOT NULL,
    Calories INT
);

-- Bảng Topping (topping)
CREATE TABLE IF NOT EXISTS topping (
    ToppingID SERIAL PRIMARY KEY,
    TenTopping VARCHAR(100) NOT NULL,
    Gia DECIMAL(10,2) NOT NULL,
    DaXoa BOOLEAN DEFAULT FALSE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Sản Phẩm Topping (sanphamtopping)
CREATE TABLE IF NOT EXISTS sanphamtopping (
    SanPhamID INT REFERENCES sanpham(SanPhamID) ON DELETE CASCADE,
    ToppingID INT REFERENCES topping(ToppingID) ON DELETE CASCADE,
    PRIMARY KEY (SanPhamID, ToppingID)
);

-- Bảng Loại Đơn Hàng (loaidonhang)
CREATE TABLE IF NOT EXISTS loaidonhang (
    LoaiDonHangID SERIAL PRIMARY KEY,
    TenLoaiDonHang VARCHAR(50) UNIQUE NOT NULL
);

-- Bảng Voucher (voucher)
CREATE TABLE IF NOT EXISTS voucher (
    VoucherID SERIAL PRIMARY KEY,
    MaVoucher VARCHAR(50) UNIQUE,
    TenVoucher VARCHAR(100),
    LoaiGiamGia VARCHAR(20), -- 'PhanTram' or 'TienMat'
    GiaTriGiam DECIMAL(10,2),
    GiaTriGiamToiDa DECIMAL(10,2),
    DonHangToiThieu DECIMAL(10,2),
    SoLuong INT,
    SoLanDungToiDa INT DEFAULT 1,
    NgayBatDau TIMESTAMP WITH TIME ZONE,
    NgayKetThuc TIMESTAMP WITH TIME ZONE,
    TrangThai VARCHAR(20) DEFAULT 'HoatDong',
    DaXoa BOOLEAN DEFAULT FALSE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Đơn Hàng (donhang)
CREATE TABLE IF NOT EXISTS donhang (
    DonHangID SERIAL PRIMARY KEY,
    MaDonHang VARCHAR(50) UNIQUE,
    KhachHangID INT REFERENCES nguoidung(NguoiDungID),
    NhanVienID INT REFERENCES nguoidung(NguoiDungID),
    BanID INT REFERENCES ban(BanID),
    TongTien DECIMAL(12,2) DEFAULT 0.00,
    GiamGia DECIMAL(12,2) DEFAULT 0.00,
    ThanhTien DECIMAL(12,2) DEFAULT 0.00,
    DiemCongThem INT DEFAULT 0,
    DiemSuDung INT DEFAULT 0,
    PhuongThucThanhToan VARCHAR(30), -- 'TienMat', 'ChuyenKhoan', 'Momo', 'ZaloPay'
    TrangThai VARCHAR(20) DEFAULT 'ChoXacNhan', -- 'ChoXacNhan', 'DangPhaChe', 'DangGiao', 'HoanThanh', 'DaHuy'
    GhiChu TEXT,
    VoucherID INT REFERENCES voucher(VoucherID),
    LoaiDonHangID INT REFERENCES loaidonhang(LoaiDonHangID),
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Chi Tiết Đơn Hàng (chitietdonhang)
CREATE TABLE IF NOT EXISTS chitietdonhang (
    ChiTietDonHangID SERIAL PRIMARY KEY,
    DonHangID INT REFERENCES donhang(DonHangID) ON DELETE CASCADE,
    SanPhamSizeID INT REFERENCES sanphamsize(SanPhamSizeID),
    SoLuong INT,
    DonGia DECIMAL(10,2),
    ThanhTien DECIMAL(12,2),
    GhiChu TEXT,
    TrangThai VARCHAR(20) DEFAULT 'ChoPhaChe'
);

-- Bảng Chi Tiết Topping (chitiettopping)
CREATE TABLE IF NOT EXISTS chitiettopping (
    ChiTietDonHangID INT REFERENCES chitietdonhang(ChiTietDonHangID) ON DELETE CASCADE,
    ToppingID INT REFERENCES topping(ToppingID) ON DELETE CASCADE,
    PRIMARY KEY (ChiTietDonHangID, ToppingID)
);

-- Bảng Đặt Bàn (datban)
CREATE TABLE IF NOT EXISTS datban (
    DatBanID SERIAL PRIMARY KEY,
    KhachHangID INT REFERENCES nguoidung(NguoiDungID),
    BanID INT REFERENCES ban(BanID),
    ThoiGianDat TIMESTAMP WITH TIME ZONE NOT NULL,
    SoNguoi INT,
    GhiChu TEXT,
    TrangThai VARCHAR(20) DEFAULT 'ChoXacNhan',
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Đánh Giá (danhgia)
CREATE TABLE IF NOT EXISTS danhgia (
    DanhGiaID SERIAL PRIMARY KEY,
    KhachHangID INT REFERENCES nguoidung(NguoiDungID),
    SanPhamID INT REFERENCES sanpham(SanPhamID),
    DonHangID INT REFERENCES donhang(DonHangID),
    SoSao INT CHECK (SoSao BETWEEN 1 AND 5),
    BinhLuan TEXT,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_danhgia UNIQUE (KhachHangID, DonHangID, SanPhamID)
);

-- Bảng Nguyên Liệu (nguyenlieu)
CREATE TABLE IF NOT EXISTS nguyenlieu (
    NguyenLieuID SERIAL PRIMARY KEY,
    TenNguyenLieu VARCHAR(100) NOT NULL,
    DonViTinh VARCHAR(20),
    SoLuongTon DECIMAL(10,2) DEFAULT 0.00,
    SoLuongToiThieu DECIMAL(10,2) DEFAULT 0.00,
    GiaNhap DECIMAL(10,2),
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Công Thức Pha Chế (congthucphache)
CREATE TABLE IF NOT EXISTS congthucphache (
    CongThucID SERIAL PRIMARY KEY,
    SanPhamID INT REFERENCES sanpham(SanPhamID),
    NguyenLieuID INT REFERENCES nguyenlieu(NguyenLieuID),
    SoLuongCan DECIMAL(10,2),
    DonViTinh VARCHAR(20),
    PhienBan INT DEFAULT 1
);

-- Bảng Thanh Toán (thanhtoan)
CREATE TABLE IF NOT EXISTS thanhtoan (
    ThanhToanID SERIAL PRIMARY KEY,
    DonHangID INT REFERENCES donhang(DonHangID) ON DELETE CASCADE,
    MaThanhToan VARCHAR(100) UNIQUE,
    SoTien DECIMAL(12,2),
    PhuongThucThanhToan VARCHAR(30),
    TrangThai VARCHAR(20) DEFAULT 'ChoThanhToan',
    MaGiaoDich VARCHAR(255),
    ThoiGianThanhToan TIMESTAMP WITH TIME ZONE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Thông Báo (thongbao)
CREATE TABLE IF NOT EXISTS thongbao (
    ThongBaoID SERIAL PRIMARY KEY,
    NguoiDungID INT REFERENCES nguoidung(NguoiDungID),
    TieuDe VARCHAR(255),
    NoiDung TEXT,
    DaDoc BOOLEAN DEFAULT FALSE,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Phân Công Ca Làm (phancongcalam)
CREATE TABLE IF NOT EXISTS phancongcalam (
    PhanCongID SERIAL PRIMARY KEY,
    NhanVienID INT REFERENCES nguoidung(NguoiDungID),
    CaLamViecID INT REFERENCES calamviec(CaLamViecID),
    NgayLam DATE,
    TrangThai VARCHAR(20) DEFAULT 'DaPhanCong',
    GioCheckIn TIMESTAMP WITH TIME ZONE,
    GioCheckOut TIMESTAMP WITH TIME ZONE,
    SoGioLam DECIMAL(5,2),
    GhiChu TEXT,
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Lịch Sử Hành Vi (lichsuhanhvi)
CREATE TABLE IF NOT EXISTS lichsuhanhvi (
    LichSuHanhViID SERIAL PRIMARY KEY,
    KhachHangID INT REFERENCES nguoidung(NguoiDungID),
    LoaiHanhVi VARCHAR(50),
    SanPhamID INT REFERENCES sanpham(SanPhamID),
    ThoiGian TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Lịch Sử Kho (lichsukho)
CREATE TABLE IF NOT EXISTS lichsukho (
    LichSuKhoID SERIAL PRIMARY KEY,
    NguyenLieuID INT REFERENCES nguyenlieu(NguyenLieuID),
    SoLuongTruoc DECIMAL(10,2),
    SoLuongThayDoi DECIMAL(10,2),
    SoLuongSau DECIMAL(10,2),
    LoaiThaoTac VARCHAR(50),
    GhiChu TEXT,
    NguoiTaoID INT REFERENCES nguoidung(NguoiDungID),
    NgayTao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Nhật Ký Hoạt Động (nhatkyhoatdong)
CREATE TABLE IF NOT EXISTS nhatkyhoatdong (
    NhatKyID SERIAL PRIMARY KEY,
    NguoiDungID INT REFERENCES nguoidung(NguoiDungID),
    HanhDong VARCHAR(255),
    BangTacDong VARCHAR(100),
    DuLieuCu JSONB,
    DuLieuMoi JSONB,
    ThoiGian TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Voucher Khách Hàng (voucherkhachhang)
CREATE TABLE IF NOT EXISTS voucherkhachhang (
    KhachHangID INT REFERENCES nguoidung(NguoiDungID),
    VoucherID INT REFERENCES voucher(VoucherID),
    DaSuDung BOOLEAN DEFAULT FALSE,
    NgaySuDung TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (KhachHangID, VoucherID)
);


-- ==========================================
-- 3. SEED DATA (DỮ LIỆU MẪU)
-- ==========================================

-- Seed Vai Trò
INSERT INTO vaitro (VaiTroID, TenVaiTro, MoTa) VALUES
(1, 'Admin', 'Quan tri he thong'),
(2, 'Manager', 'Quan ly quan'),
(3, 'Cashier', 'Thu ngan'),
(4, 'Barista', 'Nhan vien pha che'),
(5, 'Staff', 'Nhan vien phuc vu'),
(6, 'Customer', 'Khach hang')
ON CONFLICT (TenVaiTro) DO NOTHING;

-- Seed Hạng Thành Viên
INSERT INTO hangthanhvien (HangThanhVienID, TenHang, DiemToiThieu, PhanTramGiam) VALUES
(1, 'Silver', 0, 0.00),
(2, 'Gold', 1000, 5.00),
(3, 'Diamond', 5000, 10.00)
ON CONFLICT (TenHang) DO NOTHING;

-- Seed Bàn
INSERT INTO ban (BanID, TenBan, SucChua, TrangThai) VALUES
(1, 'Bàn 1', 2, 'Trong'), (2, 'Bàn 2', 2, 'DangDung'),
(3, 'Bàn 3', 4, 'Trong'), (4, 'Bàn 4', 4, 'DaDat'),
(5, 'VIP 1', 6, 'Trong'), (6, 'Bàn 5', 4, 'Trong'),
(7, 'Bàn 6', 4, 'Trong'), (8, 'Bàn 7', 4, 'Trong')
ON CONFLICT (BanID) DO NOTHING;

-- Seed Ca Làm Việc
INSERT INTO calamviec (CaLamViecID, TenCa, GioBatDau, GioKetThuc, MoTa) VALUES
(1, 'Ca Sáng', '06:00', '14:00', 'Ca mở quán'),
(2, 'Ca Chiều', '14:00', '22:00', 'Ca đóng quán')
ON CONFLICT (CaLamViecID) DO NOTHING;

-- Seed Danh Mục
INSERT INTO danhmuc (DanhMucID, TenDanhMuc, MoTa) VALUES
(1, 'Cà Phê', 'Các loại cà phê thơm ngon'),
(2, 'Trà', 'Các món trà thanh mát giải nhiệt'),
(3, 'Bánh', 'Bánh ngọt ăn kèm hấp dẫn')
ON CONFLICT (DanhMucID) DO NOTHING;

-- Seed Sản Phẩm
INSERT INTO sanpham (SanPhamID, DanhMucID, TenSanPham, MoTa, HinhAnh, ConBan, NoiBat) VALUES
(1, 1, 'CÀ PHÊ ĐEN TRUYỀN THỐNG', 'Hương vị nguyên bản.', 'fa-mug-hot', TRUE, FALSE),
(2, 1, 'BẠC XỈU ĐÁ', 'Sự kết hợp hoàn hảo.', 'fa-mug-saucer', TRUE, FALSE),
(3, 2, 'TRÀ ĐÀO CAM SẢ', 'Thanh mát giải nhiệt.', 'fa-glass-water', TRUE, FALSE),
(4, 3, 'BÁNH CROISSANT', 'Bánh sừng bò nướng bơ.', 'fa-cookie', TRUE, FALSE),
(5, 1, 'ESPRESSO Ý', 'Đậm đà, bừng tỉnh.', 'fa-mug-hot', TRUE, FALSE),
(6, 2, 'TRÀ VẢI THIỀU TỨ XUYÊN', 'Vị ngọt thanh dịu nhẹ.', 'fa-leaf', TRUE, FALSE),
(7, 3, 'TIRAMISU', 'Béo ngậy hương cà phê.', 'fa-cake-candles', TRUE, FALSE)
ON CONFLICT (SanPhamID) DO NOTHING;

-- Seed Sản Phẩm Size
INSERT INTO sanphamsize (SanPhamSizeID, SanPhamID, KichThuoc, Gia, Calories) VALUES
(1, 1, 'S', 25000, 100), (2, 1, 'M', 30000, 150), (3, 1, 'L', 35000, 200),
(4, 2, 'S', 30000, 250), (5, 2, 'M', 35000, 300), (6, 2, 'L', 40000, 350),
(7, 3, 'S', 40000, 180), (8, 3, 'M', 45000, 220), (9, 3, 'L', 50000, 260),
(10, 4, 'S', 35000, 350),
(11, 5, 'S', 35000, 5),   (12, 5, 'M', 40000, 10),  (13, 5, 'L', 45000, 15),
(14, 6, 'S', 45000, 190), (15, 6, 'M', 50000, 230), (16, 6, 'L', 55000, 280),
(17, 7, 'S', 45000, 420)
ON CONFLICT (SanPhamSizeID) DO NOTHING;

-- Seed Topping
INSERT INTO topping (ToppingID, TenTopping, Gia) VALUES
(1, 'Trân châu đen', 5000),
(2, 'Kem Macchiato', 10000)
ON CONFLICT (ToppingID) DO NOTHING;

-- Seed Map Topping
INSERT INTO sanphamtopping (SanPhamID, ToppingID) VALUES
(1, 1), (1, 2), (2, 1), (2, 2), (3, 1), (3, 2), (5, 2), (6, 1), (6, 2)
ON CONFLICT DO NOTHING;

-- Seed Loại Đơn Hàng
INSERT INTO loaidonhang (LoaiDonHangID, TenLoaiDonHang) VALUES
(1, 'TaiQuan'), (2, 'MangDi'), (3, 'DatOnline')
ON CONFLICT (TenLoaiDonHang) DO NOTHING;

-- Seed Voucher
INSERT INTO voucher (VoucherID, MaVoucher, TenVoucher, LoaiGiamGia, GiaTriGiam, GiaTriGiamToiDa, DonHangToiThieu, SoLuong, SoLanDungToiDa, TrangThai) VALUES
(1, 'GIAM10K', 'Giảm trực tiếp 10K', 'TienMat', 10000.00, 10000.00, 20000.00, 100, 1, 'HoatDong'),
(2, 'GIAM10PT', 'Giảm 10% Tối Đa 30k', 'PhanTram', 10.00, 30000.00, 50000.00, 50, 1, 'HoatDong')
ON CONFLICT (VoucherID) DO NOTHING;

-- Seed Nguyên Liệu
INSERT INTO nguyenlieu (NguyenLieuID, TenNguyenLieu, DonViTinh, SoLuongTon, SoLuongToiThieu, GiaNhap) VALUES
(1, 'Cà phê hạt xay', 'Kg', 1.5, 5, 250000),
(2, 'Sữa tươi thanh trùng', 'Lít', 2, 10, 35000),
(3, 'Sữa đặc', 'Hộp', 15, 5, 22000),
(4, 'Đào ngâm', 'Hộp', 12, 5, 65000),
(5, 'Trà túi lọc', 'Gói', 200, 50, 2000)
ON CONFLICT (NguyenLieuID) DO NOTHING;

-- Seed Người Dùng
INSERT INTO nguoidung (NguoiDungID, VaiTroID, HoTen, TenDangNhap, Email, SoDienThoai, MatKhau, TongDiem, HangThanhVienID) VALUES
(1, 6, 'Nguyễn Văn Khách', 'khachhang', 'customer@coffee.com', '0987654321', '123', 1250, 2),
(2, 1, 'Quản Trị Viên', 'admin', 'admin@coffee.com', '0909090909', 'admin123', 0, 1),
(3, 2, 'Lê Thị Quản Lý', 'manager', 'manager@coffee.com', '0911111111', '123456', 0, 1),
(4, 3, 'Trần Thu Ngân', 'cashier', 'cashier@coffee.com', '0922222222', '123456', 0, 1)
ON CONFLICT (TenDangNhap) DO NOTHING;

-- Seed Đơn Hàng Mẫu
INSERT INTO donhang (DonHangID, MaDonHang, KhachHangID, TongTien, GiamGia, ThanhTien, PhuongThucThanhToan, TrangThai, LoaiDonHangID) VALUES
(1001, '#DH1002', 1, 85000.00, 0.00, 85000.00, 'TienMat', 'HoanThanh', 1),
(1002, '#DH0981', 1, 120000.00, 0.00, 120000.00, 'ChuyenKhoan', 'HoanThanh', 3)
ON CONFLICT (DonHangID) DO NOTHING;

-- Seed Chi Tiết Đơn Hàng
INSERT INTO chitietdonhang (ChiTietDonHangID, DonHangID, SanPhamSizeID, SoLuong, DonGia, ThanhTien, TrangThai) VALUES
(1, 1001, 1, 2, 25000.00, 50000.00, 'HoanThanh'),
(2, 1001, 10, 1, 35000.00, 35000.00, 'HoanThanh'),
(3, 1002, 5, 2, 35000.00, 70000.00, 'HoanThanh'),
(4, 1002, 17, 1, 45000.00, 45000.00, 'HoanThanh')
ON CONFLICT (ChiTietDonHangID) DO NOTHING;

-- Seed Phân Công Ca Làm
INSERT INTO phancongcalam (PhanCongID, NhanVienID, CaLamViecID, NgayLam, TrangThai) VALUES
(1, 4, 1, CURRENT_DATE, 'DaPhanCong')
ON CONFLICT (PhanCongID) DO NOTHING;

-- ==========================================
-- 4. TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.NgayCapNhat = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    -- Create triggers conditionally to avoid errors if they exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_nguoidung_modtime') THEN
        CREATE TRIGGER update_nguoidung_modtime BEFORE UPDATE ON nguoidung FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sanpham_modtime') THEN
        CREATE TRIGGER update_sanpham_modtime BEFORE UPDATE ON sanpham FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_donhang_modtime') THEN
        CREATE TRIGGER update_donhang_modtime BEFORE UPDATE ON donhang FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;
