import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { getMembershipRank } from '../utils/membershipUtils'

const AuthModal = ({ onClose, onLogin, isAdminMode = false, initialMode = 'login' }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login')
  const [showPassword, setShowPassword] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Clear inputs when switching modes
  useEffect(() => {
    setError('')
  }, [isLoginMode])

  const clearForm = () => {
    setUsername('')
    setPassword('')
    setFullName('')
    setPhone('')
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const DUMMY_USER = {
      NguoiDungID: Math.floor(Math.random() * 1000) + 10,
      TenDangNhap: username,
      HoTen: fullName || 'Người dùng mới',
      VaiTroID: 6,
      VaiTro: 'Customer',
      HangThanhVienID: 1,
      TenHang: 'Thường',
      TongDiem: 0,
      GiamGia: 0,
      SoDienThoai: phone || '0987654321',
      DiaChi: '',
    }

    const DUMMY_ADMIN = {
      NguoiDungID: 2,
      TenDangNhap: 'admin',
      HoTen: 'Quản Trị Viên',
      VaiTroID: 1,
      VaiTro: 'Admin',
      HangThanhVienID: 1,
      TenHang: 'Thường',
      TongDiem: 0,
      GiamGia: 0,
      SoDienThoai: '0909090909',
      DiaChi: 'Hệ thống Coffee Journey',
    }

    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

      if (isConfigured) {
        if (isLoginMode) {
          // LOGIN LOGIC
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
            const rankInfo = getMembershipRank(data.TongDiem || 0)
            const userObj = {
              NguoiDungID: data.NguoiDungID,
              TenDangNhap: data.TenDangNhap,
              HoTen: data.HoTen,
              VaiTroID: data.VaiTroID,
              VaiTro: data.vaitro?.TenVaiTro || 'Customer',
              HangThanhVienID: rankInfo.id,
              TenHang: rankInfo.name,
              TongDiem: data.TongDiem || 0,
              GiamGia: rankInfo.discount,
              SoDienThoai: data.SoDienThoai,
              DiaChi: data.DiaChi,
            }

            if (isAdminMode && ![1, 2].includes(userObj.VaiTroID)) {
              setError('Tài khoản này không có quyền quản trị!')
              setLoading(false)
              return
            }

            clearForm()
            onLogin(userObj)
            setLoading(false)
            return
          } else {
            throw new Error('Sai tên đăng nhập hoặc mật khẩu!')
          }
        } else {
          // REGISTER LOGIC
          const { data: existingUser } = await supabase
            .from('nguoidung')
            .select('TenDangNhap')
            .eq('TenDangNhap', username)
            .maybeSingle()

          if (existingUser) {
            throw new Error('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!')
          }

          const { data: newUser, error: insertError } = await supabase
            .from('nguoidung')
            .insert({
              TenDangNhap: username,
              MatKhau: password,
              HoTen: fullName,
              SoDienThoai: phone,
              VaiTroID: 6, // Customer
              HangThanhVienID: 1 // Thường
            })
            .select(`
              *,
              vaitro:vaitro ( TenVaiTro ),
              hangthanhvien:hangthanhvien ( TenHang, PhanTramGiam )
            `)
            .single()

          if (insertError) throw insertError

          if (newUser) {
            const userObj = {
              NguoiDungID: newUser.NguoiDungID,
              TenDangNhap: newUser.TenDangNhap,
              HoTen: newUser.HoTen,
              VaiTroID: newUser.VaiTroID,
              VaiTro: newUser.vaitro?.TenVaiTro || 'Customer',
              HangThanhVienID: 1,
              TenHang: 'Thường',
              TongDiem: 0,
              GiamGia: 0,
              SoDienThoai: newUser.SoDienThoai,
              DiaChi: newUser.DiaChi,
            }
            clearForm()
            onLogin(userObj)
            setLoading(false)
            return
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi truy vấn Supabase:', err.message)
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!')
    }

    // Fallback logic if Supabase fails or not configured
    if (!import.meta.env.VITE_SUPABASE_URL) {
      if (isAdminMode) {
        if (username === 'admin' && password === 'admin123') {
          clearForm()
          onLogin(DUMMY_ADMIN)
        } else {
          setError('Sai tài khoản quản trị! (Thử: admin / admin123)')
        }
      } else {
        if (isLoginMode) {
          if (username === 'khachhang' && password === '123') {
            clearForm()
            const mockRank = getMembershipRank(350) // Mocking Bạc member with 350 pts
            onLogin({ ...DUMMY_USER, TenDangNhap: 'khachhang', HoTen: 'Nguyễn Văn Khách', TongDiem: 350, TenHang: mockRank.name, HangThanhVienID: mockRank.id, GiamGia: mockRank.discount })
          } else if (username === 'admin' && password === 'admin123') {
            clearForm()
            onLogin(DUMMY_ADMIN)
          } else {
            setError('Sai tên đăng nhập hoặc mật khẩu! (Thử: khachhang / 123)')
          }
        } else {
          clearForm()
          onLogin(DUMMY_USER) // Mock successful register as Thường with 0 pts
        }
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      setError('Tính năng đăng nhập Google hiện chưa được cấu hình hoàn chỉnh.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-[70] p-3 sm:p-4 transition-opacity duration-300">
      <div className="glass-effect p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] relative max-w-md w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar animate-zoom-in">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-red-500 hover:text-white flex items-center justify-center text-size-1 text-gray-500 transition-all duration-300 shadow-sm"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}

        {/* Header Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-coffee-green to-emerald-400 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-coffee-green/30 rotate-3 hover:rotate-0 transition-all duration-300">
          <i className={`fa-solid ${isAdminMode ? 'fa-user-shield' : 'fa-seedling'} text-[2.5rem] -rotate-3 hover:rotate-0 transition-all duration-300`}></i>
        </div>

        {/* Title */}
        <h2 className="text-size-2 font-black text-coffee-green mb-1 text-center uppercase tracking-tighter">
          {isAdminMode ? 'Hệ Thống Admin' : (isLoginMode ? 'Đăng Nhập' : 'Đăng Ký')}
        </h2>
        <p className="text-[0.8rem] font-bold text-gray-500 text-center uppercase tracking-widest mb-6">
          {isAdminMode ? 'Dành Cho Quản Trị' : 'Chào Mừng Đến Với Heritage'}
        </p>

        {/* Toggle Login/Register for non-admin */}
        {!isAdminMode && (
          <div className="flex bg-gray-100/50 p-1 rounded-2xl mb-6 shadow-inner border border-white/40">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 text-[0.85rem] ${isLoginMode ? 'bg-white text-coffee-green shadow-sm shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 text-[0.85rem] ${!isLoginMode ? 'bg-white text-coffee-green shadow-sm shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Đăng Ký
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50/90 backdrop-blur-md rounded-2xl border border-red-200 flex items-center gap-3 animate-shake">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <p className="text-red-600 text-[0.85rem] font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">

          {/* Register Extra Fields */}
          {!isLoginMode && (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <label className="block text-[0.75rem] font-black mb-1 ml-2 text-gray-400 uppercase tracking-widest">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-coffee-green transition-colors">
                    <i className="fa-solid fa-id-card"></i>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none focus:border-coffee-green focus:ring-2 focus:ring-coffee-green/20 transition-all shadow-sm"
                    required
                    placeholder="Nhập họ và tên..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-black mb-1 ml-2 text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-coffee-green transition-colors">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none focus:border-coffee-green focus:ring-2 focus:ring-coffee-green/20 transition-all shadow-sm"
                    required
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[0.75rem] font-black mb-1 ml-2 text-gray-400 uppercase tracking-widest">Tên đăng nhập</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-coffee-green transition-colors">
                <i className="fa-solid fa-user"></i>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none focus:border-coffee-green focus:ring-2 focus:ring-coffee-green/20 transition-all shadow-sm"
                required
                placeholder={isAdminMode ? 'Nhập tên quản trị...' : 'Nhập tên đăng nhập...'}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.75rem] font-black mb-1 ml-2 text-gray-400 uppercase tracking-widest">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-coffee-green transition-colors">
                <i className="fa-solid fa-lock"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3.5 pl-11 pr-12 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none focus:border-coffee-green focus:ring-2 focus:ring-coffee-green/20 transition-all shadow-sm tracking-widest"
                required
                placeholder="Nhập mật khẩu..."
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-coffee-green transition-colors focus:outline-none"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-coffee-green to-emerald-500 hover:from-emerald-600 hover:to-coffee-green text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-coffee-green/30 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner animate-spin"></i> Đang Xử Lý...
              </span>
            ) : (
              isAdminMode ? 'Đăng Nhập Quản Trị' : (isLoginMode ? 'Vào Quán' : 'Tạo Tài Khoản')
            )}
          </button>
        </form>

        {!isAdminMode && (
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-white/50 px-3 text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest absolute">Hoặc</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Tiếp tục với Google
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default AuthModal
