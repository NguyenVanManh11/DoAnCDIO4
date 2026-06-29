import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthModal = ({ onClose, onLogin, isAdminMode = false }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Standard fallback credentials
    const DUMMY_USER = {
      NguoiDungID: 1,
      TenDangNhap: 'khachhang',
      HoTen: 'Nguyễn Văn Khách',
      VaiTroID: 6,
      VaiTro: 'Customer',
      HangThanhVienID: 2,
      TenHang: 'Gold',
      TongDiem: 1250,
      GiamGia: 5,
      SoDienThoai: '0987654321',
      DiaChi: '123 Đường Cà Phê, Quận 1',
    }

    const DUMMY_ADMIN = {
      NguoiDungID: 2,
      TenDangNhap: 'admin',
      HoTen: 'Quản Trị Viên',
      VaiTroID: 1,
      VaiTro: 'Admin',
      HangThanhVienID: 1,
      TenHang: 'Silver',
      TongDiem: 0,
      GiamGia: 0,
      SoDienThoai: '0909090909',
      DiaChi: 'Hệ thống Coffee Journey',
    }

    // Try Supabase Query
    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

      if (isConfigured) {
        // Query user table joining vaitro and hangthanhvien
        const { data, error: dbError } = await supabase
          .from('nguoidung')
          .select(`
            *,
            vaitro:vaitro ( TenVaiTro ),
            hangthanhvien:hangthanhvien ( TenHang, PhanTramGiam )
          `)
          .eq('TenDangNhap', username)
          .eq('MatKhau', password)
          .eq('DaXoa', false)
          .maybeSingle()

        if (dbError) throw dbError

        if (data) {
          const userObj = {
            NguoiDungID: data.NguoiDungID,
            TenDangNhap: data.TenDangNhap,
            HoTen: data.HoTen,
            VaiTroID: data.VaiTroID,
            VaiTro: data.vaitro?.TenVaiTro || 'Customer',
            HangThanhVienID: data.HangThanhVienID,
            TenHang: data.hangthanhvien?.TenHang || 'Silver',
            TongDiem: data.TongDiem || 0,
            GiamGia: data.hangthanhvien?.PhanTramGiam ? parseFloat(data.hangthanhvien.PhanTramGiam) : 0,
            SoDienThoai: data.SoDienThoai,
            DiaChi: data.DiaChi,
          }

          if (isAdminMode && ![1, 2].includes(userObj.VaiTroID)) {
            setError('Tài khoản này không có quyền quản trị!')
            setLoading(false)
            return
          }

          onLogin(userObj)
          setLoading(false)
          return
        }
      }
    } catch (err) {
      console.error('Lỗi khi truy vấn Supabase:', err.message)
    }

    // Fallback logic
    if (isAdminMode) {
      if (username === 'admin' && password === 'admin123') {
        onLogin(DUMMY_ADMIN)
      } else {
        setError('Sai tài khoản quản trị! (Thử: admin / admin123)')
      }
    } else {
      if (username === 'khachhang' && password === '123') {
        onLogin(DUMMY_USER)
      } else if (username === 'admin' && password === 'admin123') {
        onLogin(DUMMY_ADMIN)
      } else {
        setError('Sai tên đăng nhập hoặc mật khẩu! (Thử: khachhang / 123)')
      }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="glass-effect p-8 md:p-10 rounded-[2.5rem] relative max-w-md w-full shadow-2xl border border-white/20">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 btn-icon"
        >
          &times;
        </button>
 
        <div className="w-16 h-16 bg-coffee-green rounded-[1.5rem] flex items-center justify-center text-white mx-auto mb-4 shadow-lg rotate-3">
          <i className={`fa-solid ${isAdminMode ? 'fa-user-shield' : 'fa-seedling'} text-size-2 -rotate-3`}></i>
        </div>
 
        <h2 className="text-size-2 font-black text-coffee-green mb-1 text-center uppercase tracking-tighter">
          {isAdminMode ? 'Hệ Thống Admin' : 'Đăng Nhập'}
        </h2>
        <p className="text-size-0 font-bold text-gray-500 text-center uppercase tracking-widest mb-6">
          {isAdminMode ? 'Dành Cho Quản Trị' : 'Chào Mừng Đến Với Heritage'}
        </p>
 
        {error && (
          <p className="text-red-500 mb-4 text-size-0 font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">
            {error}
          </p>
        )}
 
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none"
              required
              placeholder={isAdminMode ? 'admin' : 'khachhang'}
            />
          </div>
          <div>
            <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none"
              required
              placeholder={isAdminMode ? 'admin123' : '123'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 mt-4 text-size-1"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i> Đang Xử Lý...
              </>
            ) : (
              'Vào Quán'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
