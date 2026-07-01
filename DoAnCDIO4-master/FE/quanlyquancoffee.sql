-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 26, 2026 lúc 12:24 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `quanlyquancoffee`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ban`
--

CREATE TABLE `ban` (
  `BanID` int(11) NOT NULL,
  `TenBan` varchar(50) NOT NULL,
  `SucChua` int(11) NOT NULL,
  `QRCode` varchar(255) DEFAULT NULL,
  `TrangThai` enum('Trong','DangDung','DaDat','BaoTri') DEFAULT 'Trong',
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `calamviec`
--

CREATE TABLE `calamviec` (
  `CaLamViecID` int(11) NOT NULL,
  `TenCa` varchar(50) DEFAULT NULL,
  `GioBatDau` time DEFAULT NULL,
  `GioKetThuc` time DEFAULT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `ChiTietDonHangID` bigint(20) NOT NULL,
  `DonHangID` bigint(20) DEFAULT NULL,
  `SanPhamSizeID` bigint(20) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT NULL,
  `DonGia` decimal(10,2) DEFAULT NULL,
  `ThanhTien` decimal(12,2) DEFAULT NULL,
  `GhiChu` text DEFAULT NULL,
  `TrangThai` enum('ChoPhaChe','DangPhaChe','HoanThanh','DaGiao') DEFAULT 'ChoPhaChe'
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitiettopping`
--

CREATE TABLE `chitiettopping` (
  `ChiTietDonHangID` bigint(20) NOT NULL,
  `ToppingID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `congthucphache`
--

CREATE TABLE `congthucphache` (
  `CongThucID` bigint(20) NOT NULL,
  `SanPhamID` bigint(20) DEFAULT NULL,
  `NguyenLieuID` int(11) DEFAULT NULL,
  `SoLuongCan` decimal(10,2) DEFAULT NULL,
  `DonViTinh` varchar(20) DEFAULT NULL,
  `PhienBan` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `DanhGiaID` bigint(20) NOT NULL,
  `KhachHangID` bigint(20) DEFAULT NULL,
  `SanPhamID` bigint(20) DEFAULT NULL,
  `DonHangID` bigint(20) DEFAULT NULL,
  `SoSao` int(11) DEFAULT NULL,
  `BinhLuan` text DEFAULT NULL,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmuc`
--

CREATE TABLE `danhmuc` (
  `DanhMucID` int(11) NOT NULL,
  `TenDanhMuc` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL,
  `DaXoa` tinyint(1) DEFAULT 0,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `datban`
--

CREATE TABLE `datban` (
  `DatBanID` bigint(20) NOT NULL,
  `KhachHangID` bigint(20) DEFAULT NULL,
  `BanID` int(11) DEFAULT NULL,
  `ThoiGianDat` datetime NOT NULL,
  `SoNguoi` int(11) DEFAULT NULL,
  `GhiChu` text DEFAULT NULL,
  `TrangThai` enum('ChoXacNhan','DaXacNhan','DaHuy','HoanThanh') DEFAULT 'ChoXacNhan',
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

CREATE TABLE `donhang` (
  `DonHangID` bigint(20) NOT NULL,
  `MaDonHang` varchar(50) DEFAULT NULL,
  `KhachHangID` bigint(20) DEFAULT NULL,
  `NhanVienID` bigint(20) DEFAULT NULL,
  `BanID` int(11) DEFAULT NULL,
  `TongTien` decimal(12,2) DEFAULT 0.00,
  `GiamGia` decimal(12,2) DEFAULT 0.00,
  `ThanhTien` decimal(12,2) DEFAULT 0.00,
  `DiemCongThem` int(11) DEFAULT 0,
  `DiemSuDung` int(11) DEFAULT 0,
  `PhuongThucThanhToan` enum('TienMat','ChuyenKhoan','Momo','ZaloPay') DEFAULT NULL,
  `TrangThai` enum('ChoXacNhan','DangPhaChe','DangGiao','HoanThanh','DaHuy') DEFAULT 'ChoXacNhan',
  `GhiChu` text DEFAULT NULL,
  `VoucherID` bigint(20) DEFAULT NULL,
  `LoaiDonHangID` int(11) DEFAULT NULL,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp(),
  `NgayCapNhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hangthanhvien`
--

CREATE TABLE `hangthanhvien` (
  `HangThanhVienID` int(11) NOT NULL,
  `TenHang` varchar(50) DEFAULT NULL,
  `DiemToiThieu` int(11) DEFAULT 0,
  `PhanTramGiam` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hangthanhvien`
--

INSERT INTO `hangthanhvien` (`HangThanhVienID`, `TenHang`, `DiemToiThieu`, `PhanTramGiam`) VALUES
(1, 'Silver', 0, 0.00),
(2, 'Gold', 1000, 5.00),
(3, 'Diamond', 5000, 10.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsuhanhvi`
--

CREATE TABLE `lichsuhanhvi` (
  `LichSuHanhViID` bigint(20) NOT NULL,
  `KhachHangID` bigint(20) DEFAULT NULL,
  `LoaiHanhVi` enum('XemSanPham','ThemGioHang','DatHang','DanhGia','TimKiem') DEFAULT NULL,
  `SanPhamID` bigint(20) DEFAULT NULL,
  `ThoiGian` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsukho`
--

CREATE TABLE `lichsukho` (
  `LichSuKhoID` bigint(20) NOT NULL,
  `NguyenLieuID` int(11) DEFAULT NULL,
  `SoLuongTruoc` decimal(10,2) DEFAULT NULL,
  `SoLuongThayDoi` decimal(10,2) DEFAULT NULL,
  `SoLuongSau` decimal(10,2) DEFAULT NULL,
  `LoaiThaoTac` enum('NhapKho','XuatKho','Huy','KiemKe') DEFAULT NULL,
  `GhiChu` text DEFAULT NULL,
  `NguoiTaoID` bigint(20) DEFAULT NULL,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loaidonhang`
--

CREATE TABLE `loaidonhang` (
  `LoaiDonHangID` int(11) NOT NULL,
  `TenLoaiDonHang` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `loaidonhang`
--

INSERT INTO `loaidonhang` (`LoaiDonHangID`, `TenLoaiDonHang`) VALUES
(1, 'TaiQuan'),
(2, 'MangDi'),
(3, 'DatOnline');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `NguoiDungID` bigint(20) NOT NULL,
  `VaiTroID` int(11) DEFAULT NULL,
  `HoTen` varchar(100) NOT NULL,
  `TenDangNhap` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `AnhDaiDien` varchar(255) DEFAULT NULL,
  `GioiTinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `NgaySinh` date DEFAULT NULL,
  `DiaChi` text DEFAULT NULL,
  `TrangThai` enum('HoatDong','BiKhoa','TamNgung') DEFAULT 'HoatDong',
  `TongDiem` int(11) DEFAULT 0,
  `HangThanhVienID` int(11) DEFAULT NULL,
  `DaXoa` tinyint(1) DEFAULT 0,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp(),
  `NgayCapNhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguyenlieu`
--

CREATE TABLE `nguyenlieu` (
  `NguyenLieuID` int(11) NOT NULL,
  `TenNguyenLieu` varchar(100) NOT NULL,
  `DonViTinh` varchar(20) DEFAULT NULL,
  `SoLuongTon` decimal(10,2) DEFAULT 0.00,
  `SoLuongToiThieu` decimal(10,2) DEFAULT 0.00,
  `GiaNhap` decimal(10,2) DEFAULT NULL,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhatkyhoatdong`
--

CREATE TABLE `nhatkyhoatdong` (
  `NhatKyID` bigint(20) NOT NULL,
  `NguoiDungID` bigint(20) DEFAULT NULL,
  `HanhDong` varchar(255) DEFAULT NULL,
  `BangTacDong` varchar(100) DEFAULT NULL,
  `DuLieuCu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`DuLieuCu`)),
  `DuLieuMoi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`DuLieuMoi`)),
  `ThoiGian` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phancongcalam`
--

CREATE TABLE `phancongcalam` (
  `PhanCongID` bigint(20) NOT NULL,
  `NhanVienID` bigint(20) DEFAULT NULL,
  `CaLamViecID` int(11) DEFAULT NULL,
  `NgayLam` date DEFAULT NULL,
  `TrangThai` enum('DaPhanCong','DaCheckIn','DaCheckOut','Vang') DEFAULT 'DaPhanCong',
  `GioCheckIn` datetime DEFAULT NULL,
  `GioCheckOut` datetime DEFAULT NULL,
  `SoGioLam` decimal(5,2) DEFAULT NULL,
  `GhiChu` text DEFAULT NULL,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham`
--

CREATE TABLE `sanpham` (
  `SanPhamID` bigint(20) NOT NULL,
  `DanhMucID` int(11) DEFAULT NULL,
  `TenSanPham` varchar(150) NOT NULL,
  `MoTa` text DEFAULT NULL,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `ConBan` tinyint(1) DEFAULT 1,
  `NoiBat` tinyint(1) DEFAULT 0,
  `DaXoa` tinyint(1) DEFAULT 0,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp(),
  `NgayCapNhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanphamsize`
--

CREATE TABLE `sanphamsize` (
  `SanPhamSizeID` bigint(20) NOT NULL,
  `SanPhamID` bigint(20) NOT NULL,
  `KichThuoc` enum('S','M','L') DEFAULT NULL,
  `Gia` decimal(10,2) NOT NULL,
  `Calories` int(11) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanphamtopping`
--

CREATE TABLE `sanphamtopping` (
  `SanPhamID` bigint(20) NOT NULL,
  `ToppingID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanhtoan`
--

CREATE TABLE `thanhtoan` (
  `ThanhToanID` bigint(20) NOT NULL,
  `DonHangID` bigint(20) DEFAULT NULL,
  `MaThanhToan` varchar(100) DEFAULT NULL,
  `SoTien` decimal(12,2) DEFAULT NULL,
  `PhuongThucThanhToan` enum('TienMat','ChuyenKhoan','Momo','ZaloPay') DEFAULT NULL,
  `TrangThai` enum('ChoThanhToan','DaThanhToan','ThatBai','HoanTien') DEFAULT 'ChoThanhToan',
  `MaGiaoDich` varchar(255) DEFAULT NULL,
  `ThoiGianThanhToan` datetime DEFAULT NULL,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongbao`
--

CREATE TABLE `thongbao` (
  `ThongBaoID` bigint(20) NOT NULL,
  `NguoiDungID` bigint(20) DEFAULT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `DaDoc` tinyint(1) DEFAULT 0,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `topping`
--

CREATE TABLE `topping` (
  `ToppingID` int(11) NOT NULL,
  `TenTopping` varchar(100) NOT NULL,
  `Gia` decimal(10,2) NOT NULL,
  `DaXoa` tinyint(1) DEFAULT 0,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vaitro`
--

CREATE TABLE `vaitro` (
  `VaiTroID` int(11) NOT NULL,
  `TenVaiTro` varchar(50) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `vaitro`
--

INSERT INTO `vaitro` (`VaiTroID`, `TenVaiTro`, `MoTa`) VALUES
(1, 'Admin', 'Quan tri he thong'),
(2, 'Manager', 'Quan ly quan'),
(3, 'Cashier', 'Thu ngan'),
(4, 'Barista', 'Nhan vien pha che'),
(5, 'Staff', 'Nhan vien phuc vu'),
(6, 'Customer', 'Khach hang');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher`
--

CREATE TABLE `voucher` (
  `VoucherID` bigint(20) NOT NULL,
  `MaVoucher` varchar(50) DEFAULT NULL,
  `TenVoucher` varchar(100) DEFAULT NULL,
  `LoaiGiamGia` enum('PhanTram','TienMat') DEFAULT NULL,
  `GiaTriGiam` decimal(10,2) DEFAULT NULL,
  `GiaTriGiamToiDa` decimal(10,2) DEFAULT NULL,
  `DonHangToiThieu` decimal(10,2) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT NULL,
  `SoLanDungToiDa` int(11) DEFAULT 1,
  `NgayBatDau` datetime DEFAULT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  `TrangThai` enum('HoatDong','TamDung','HetHan') DEFAULT 'HoatDong',
  `DaXoa` tinyint(1) DEFAULT 0,
  `NgayTao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucherkhachhang`
--

CREATE TABLE `voucherkhachhang` (
  `KhachHangID` bigint(20) NOT NULL,
  `VoucherID` bigint(20) NOT NULL,
  `DaSuDung` tinyint(1) DEFAULT 0,
  `NgaySuDung` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `ban`
--
ALTER TABLE `ban`
  ADD PRIMARY KEY (`BanID`);

--
-- Chỉ mục cho bảng `calamviec`
--
ALTER TABLE `calamviec`
  ADD PRIMARY KEY (`CaLamViecID`);

--
-- Chỉ mục cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`ChiTietDonHangID`),
  ADD KEY `fk_ctdh_donhang` (`DonHangID`),
  ADD KEY `fk_ctdh_sanphamsize` (`SanPhamSizeID`);

--
-- Chỉ mục cho bảng `chitiettopping`
--
ALTER TABLE `chitiettopping`
  ADD PRIMARY KEY (`ChiTietDonHangID`,`ToppingID`),
  ADD KEY `fk_ctt_topping` (`ToppingID`);

--
-- Chỉ mục cho bảng `congthucphache`
--
ALTER TABLE `congthucphache`
  ADD PRIMARY KEY (`CongThucID`),
  ADD KEY `fk_ctpc_sanpham` (`SanPhamID`),
  ADD KEY `fk_ctpc_nguyenlieu` (`NguyenLieuID`);

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`DanhGiaID`),
  ADD UNIQUE KEY `uq_danhgia` (`KhachHangID`,`DonHangID`,`SanPhamID`),
  ADD KEY `fk_danhgia_sanpham` (`SanPhamID`),
  ADD KEY `fk_danhgia_donhang` (`DonHangID`);

--
-- Chỉ mục cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`DanhMucID`);

--
-- Chỉ mục cho bảng `datban`
--
ALTER TABLE `datban`
  ADD PRIMARY KEY (`DatBanID`),
  ADD KEY `fk_datban_khachhang` (`KhachHangID`),
  ADD KEY `fk_datban_ban` (`BanID`);

--
-- Chỉ mục cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`DonHangID`),
  ADD UNIQUE KEY `MaDonHang` (`MaDonHang`),
  ADD KEY `fk_donhang_nhanvien` (`NhanVienID`),
  ADD KEY `fk_donhang_ban` (`BanID`),
  ADD KEY `fk_donhang_voucher` (`VoucherID`),
  ADD KEY `fk_donhang_loaidonhang` (`LoaiDonHangID`),
  ADD KEY `idx_donhang_trangthai_ngaytao` (`TrangThai`,`NgayTao`),
  ADD KEY `idx_donhang_khachhang_ngaytao` (`KhachHangID`,`NgayTao`);

--
-- Chỉ mục cho bảng `hangthanhvien`
--
ALTER TABLE `hangthanhvien`
  ADD PRIMARY KEY (`HangThanhVienID`);

--
-- Chỉ mục cho bảng `lichsuhanhvi`
--
ALTER TABLE `lichsuhanhvi`
  ADD PRIMARY KEY (`LichSuHanhViID`),
  ADD KEY `fk_lshv_khachhang` (`KhachHangID`),
  ADD KEY `fk_lshv_sanpham` (`SanPhamID`);

--
-- Chỉ mục cho bảng `lichsukho`
--
ALTER TABLE `lichsukho`
  ADD PRIMARY KEY (`LichSuKhoID`),
  ADD KEY `fk_lsk_nguyenlieu` (`NguyenLieuID`),
  ADD KEY `fk_lsk_nguoidung` (`NguoiTaoID`);

--
-- Chỉ mục cho bảng `loaidonhang`
--
ALTER TABLE `loaidonhang`
  ADD PRIMARY KEY (`LoaiDonHangID`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`NguoiDungID`),
  ADD UNIQUE KEY `TenDangNhap` (`TenDangNhap`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `SoDienThoai` (`SoDienThoai`),
  ADD KEY `fk_nguoidung_vaitro` (`VaiTroID`),
  ADD KEY `fk_nguoidung_hangthanhvien` (`HangThanhVienID`);

--
-- Chỉ mục cho bảng `nguyenlieu`
--
ALTER TABLE `nguyenlieu`
  ADD PRIMARY KEY (`NguyenLieuID`);

--
-- Chỉ mục cho bảng `nhatkyhoatdong`
--
ALTER TABLE `nhatkyhoatdong`
  ADD PRIMARY KEY (`NhatKyID`),
  ADD KEY `fk_nkhd_nguoidung` (`NguoiDungID`);

--
-- Chỉ mục cho bảng `phancongcalam`
--
ALTER TABLE `phancongcalam`
  ADD PRIMARY KEY (`PhanCongID`),
  ADD KEY `fk_pcc_nguoidung` (`NhanVienID`),
  ADD KEY `fk_pcc_calam` (`CaLamViecID`);

--
-- Chỉ mục cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`SanPhamID`),
  ADD KEY `idx_sanpham_danhmuc` (`DanhMucID`);

--
-- Chỉ mục cho bảng `sanphamsize`
--
ALTER TABLE `sanphamsize`
  ADD PRIMARY KEY (`SanPhamSizeID`),
  ADD KEY `fk_sanphamsize_sanpham` (`SanPhamID`);

--
-- Chỉ mục cho bảng `sanphamtopping`
--
ALTER TABLE `sanphamtopping`
  ADD PRIMARY KEY (`SanPhamID`,`ToppingID`),
  ADD KEY `fk_spt_topping` (`ToppingID`);

--
-- Chỉ mục cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD PRIMARY KEY (`ThanhToanID`),
  ADD UNIQUE KEY `MaThanhToan` (`MaThanhToan`),
  ADD KEY `fk_thanhtoan_donhang` (`DonHangID`),
  ADD KEY `idx_thanhtoan_trangthai_time` (`TrangThai`,`ThoiGianThanhToan`);

--
-- Chỉ mục cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD PRIMARY KEY (`ThongBaoID`),
  ADD KEY `fk_thongbao_nguoidung` (`NguoiDungID`);

--
-- Chỉ mục cho bảng `topping`
--
ALTER TABLE `topping`
  ADD PRIMARY KEY (`ToppingID`);

--
-- Chỉ mục cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  ADD PRIMARY KEY (`VaiTroID`),
  ADD UNIQUE KEY `TenVaiTro` (`TenVaiTro`);

--
-- Chỉ mục cho bảng `voucher`
--
ALTER TABLE `voucher`
  ADD PRIMARY KEY (`VoucherID`),
  ADD UNIQUE KEY `MaVoucher` (`MaVoucher`);

--
-- Chỉ mục cho bảng `voucherkhachhang`
--
ALTER TABLE `voucherkhachhang`
  ADD PRIMARY KEY (`KhachHangID`,`VoucherID`),
  ADD KEY `fk_vkh_voucher` (`VoucherID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `ban`
--
ALTER TABLE `ban`
  MODIFY `BanID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `calamviec`
--
ALTER TABLE `calamviec`
  MODIFY `CaLamViecID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  MODIFY `ChiTietDonHangID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `congthucphache`
--
ALTER TABLE `congthucphache`
  MODIFY `CongThucID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `DanhGiaID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `DanhMucID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `datban`
--
ALTER TABLE `datban`
  MODIFY `DatBanID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `DonHangID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hangthanhvien`
--
ALTER TABLE `hangthanhvien`
  MODIFY `HangThanhVienID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `lichsuhanhvi`
--
ALTER TABLE `lichsuhanhvi`
  MODIFY `LichSuHanhViID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lichsukho`
--
ALTER TABLE `lichsukho`
  MODIFY `LichSuKhoID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `loaidonhang`
--
ALTER TABLE `loaidonhang`
  MODIFY `LoaiDonHangID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `NguoiDungID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nguyenlieu`
--
ALTER TABLE `nguyenlieu`
  MODIFY `NguyenLieuID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nhatkyhoatdong`
--
ALTER TABLE `nhatkyhoatdong`
  MODIFY `NhatKyID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `phancongcalam`
--
ALTER TABLE `phancongcalam`
  MODIFY `PhanCongID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `SanPhamID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sanphamsize`
--
ALTER TABLE `sanphamsize`
  MODIFY `SanPhamSizeID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `ThanhToanID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `ThongBaoID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `topping`
--
ALTER TABLE `topping`
  MODIFY `ToppingID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  MODIFY `VaiTroID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `voucher`
--
ALTER TABLE `voucher`
  MODIFY `VoucherID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `fk_ctdh_donhang` FOREIGN KEY (`DonHangID`) REFERENCES `donhang` (`DonHangID`),
  ADD CONSTRAINT `fk_ctdh_sanphamsize` FOREIGN KEY (`SanPhamSizeID`) REFERENCES `sanphamsize` (`SanPhamSizeID`);

--
-- Các ràng buộc cho bảng `chitiettopping`
--
ALTER TABLE `chitiettopping`
  ADD CONSTRAINT `fk_ctt_ctdh` FOREIGN KEY (`ChiTietDonHangID`) REFERENCES `chitietdonhang` (`ChiTietDonHangID`),
  ADD CONSTRAINT `fk_ctt_topping` FOREIGN KEY (`ToppingID`) REFERENCES `topping` (`ToppingID`);

--
-- Các ràng buộc cho bảng `congthucphache`
--
ALTER TABLE `congthucphache`
  ADD CONSTRAINT `fk_ctpc_nguyenlieu` FOREIGN KEY (`NguyenLieuID`) REFERENCES `nguyenlieu` (`NguyenLieuID`),
  ADD CONSTRAINT `fk_ctpc_sanpham` FOREIGN KEY (`SanPhamID`) REFERENCES `sanpham` (`SanPhamID`);

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `fk_danhgia_donhang` FOREIGN KEY (`DonHangID`) REFERENCES `donhang` (`DonHangID`),
  ADD CONSTRAINT `fk_danhgia_khachhang` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `fk_danhgia_sanpham` FOREIGN KEY (`SanPhamID`) REFERENCES `sanpham` (`SanPhamID`);

--
-- Các ràng buộc cho bảng `datban`
--
ALTER TABLE `datban`
  ADD CONSTRAINT `fk_datban_ban` FOREIGN KEY (`BanID`) REFERENCES `ban` (`BanID`),
  ADD CONSTRAINT `fk_datban_khachhang` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `fk_donhang_ban` FOREIGN KEY (`BanID`) REFERENCES `ban` (`BanID`),
  ADD CONSTRAINT `fk_donhang_khachhang` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `fk_donhang_loaidonhang` FOREIGN KEY (`LoaiDonHangID`) REFERENCES `loaidonhang` (`LoaiDonHangID`),
  ADD CONSTRAINT `fk_donhang_nhanvien` FOREIGN KEY (`NhanVienID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `fk_donhang_voucher` FOREIGN KEY (`VoucherID`) REFERENCES `voucher` (`VoucherID`);

--
-- Các ràng buộc cho bảng `lichsuhanhvi`
--
ALTER TABLE `lichsuhanhvi`
  ADD CONSTRAINT `fk_lshv_khachhang` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `fk_lshv_sanpham` FOREIGN KEY (`SanPhamID`) REFERENCES `sanpham` (`SanPhamID`);

--
-- Các ràng buộc cho bảng `lichsukho`
--
ALTER TABLE `lichsukho`
  ADD CONSTRAINT `fk_lsk_nguoidung` FOREIGN KEY (`NguoiTaoID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `fk_lsk_nguyenlieu` FOREIGN KEY (`NguyenLieuID`) REFERENCES `nguyenlieu` (`NguyenLieuID`);

--
-- Các ràng buộc cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD CONSTRAINT `fk_nguoidung_hangthanhvien` FOREIGN KEY (`HangThanhVienID`) REFERENCES `hangthanhvien` (`HangThanhVienID`),
  ADD CONSTRAINT `fk_nguoidung_vaitro` FOREIGN KEY (`VaiTroID`) REFERENCES `vaitro` (`VaiTroID`);

--
-- Các ràng buộc cho bảng `nhatkyhoatdong`
--
ALTER TABLE `nhatkyhoatdong`
  ADD CONSTRAINT `fk_nkhd_nguoidung` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `phancongcalam`
--
ALTER TABLE `phancongcalam`
  ADD CONSTRAINT `fk_pcc_calam` FOREIGN KEY (`CaLamViecID`) REFERENCES `calamviec` (`CaLamViecID`),
  ADD CONSTRAINT `fk_pcc_nguoidung` FOREIGN KEY (`NhanVienID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `fk_sanpham_danhmuc` FOREIGN KEY (`DanhMucID`) REFERENCES `danhmuc` (`DanhMucID`);

--
-- Các ràng buộc cho bảng `sanphamsize`
--
ALTER TABLE `sanphamsize`
  ADD CONSTRAINT `fk_sanphamsize_sanpham` FOREIGN KEY (`SanPhamID`) REFERENCES `sanpham` (`SanPhamID`);

--
-- Các ràng buộc cho bảng `sanphamtopping`
--
ALTER TABLE `sanphamtopping`
  ADD CONSTRAINT `fk_spt_sanpham` FOREIGN KEY (`SanPhamID`) REFERENCES `sanpham` (`SanPhamID`),
  ADD CONSTRAINT `fk_spt_topping` FOREIGN KEY (`ToppingID`) REFERENCES `topping` (`ToppingID`);

--
-- Các ràng buộc cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD CONSTRAINT `fk_thanhtoan_donhang` FOREIGN KEY (`DonHangID`) REFERENCES `donhang` (`DonHangID`);

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `fk_thongbao_nguoidung` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `voucherkhachhang`
--
ALTER TABLE `voucherkhachhang`
  ADD CONSTRAINT `fk_vkh_khachhang` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `fk_vkh_voucher` FOREIGN KEY (`VoucherID`) REFERENCES `voucher` (`VoucherID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
