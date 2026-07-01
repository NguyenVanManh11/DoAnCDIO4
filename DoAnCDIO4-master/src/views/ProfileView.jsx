import React, { useState } from 'react'
import { getMembershipRank, getNextTierInfo, MEMBERSHIP_TIERS } from '../utils/membershipUtils'
import { supabase } from '../supabaseClient'

const ProfileView = ({ user, onLogout, onUpdateUser, showNotify }) => {

  const [showRankModal, setShowRankModal] = useState(false)

  if (!user) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <h2 className="text-size-2 font-black uppercase text-gray-500">
          Vui lòng đăng nhập để xem thông tin
        </h2>
      </div>
    )
  }

  const currentRank = getMembershipRank(user.TongDiem || 0)
  const nextTierInfo = getNextTierInfo(user.TongDiem || 0)

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    HoTen: user?.HoTen || '',
    SoDienThoai: user?.SoDienThoai || '',
    DiaChi: user?.DiaChi || '',
    Email: user?.Email || '',
    GioiTinh: user?.GioiTinh || 'Khác',
    NgaySinh: user?.NgaySinh || ''
  })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!formData.HoTen.trim()) {
      if (showNotify) showNotify('Vui lòng nhập họ tên!')
      return
    }
    setLoading(true)
    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      if (isConfigured && user?.NguoiDungID) {
        const { error } = await supabase
          .from('nguoidung')
          .update({
            HoTen: formData.HoTen,
            SoDienThoai: formData.SoDienThoai,
            DiaChi: formData.DiaChi,
            Email: formData.Email,
            GioiTinh: formData.GioiTinh,
            NgaySinh: formData.NgaySinh || null
          })
          .eq('NguoiDungID', user.NguoiDungID)
        if (error) throw error
      }
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          ...formData
        })
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Lỗi khi cập nhật hồ sơ:', err.message)
      if (showNotify) showNotify('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in relative">
      <h2 className="text-size-2 font-black uppercase text-coffee-dark text-center mb-8 tracking-tighter">
        Hồ Sơ Của Bạn
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Thông tin cá nhân */}
        <div className="glass-effect p-8 md:p-10 rounded-[3rem] shadow-xl text-center border border-white">
          <div className="w-32 h-32 bg-gradient-to-tr from-coffee-yellow to-yellow-300 rounded-[2.5rem] rotate-3 mx-auto mb-6 flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-user text-[4rem] -rotate-3"></i>
          </div>
          <h3 className="text-size-2 font-black uppercase text-coffee-dark mb-2 leading-none">
            {user.HoTen}
          </h3>
          <div className={`inline-block px-5 py-2 rounded-full text-size-1 font-black mb-6 border uppercase tracking-widest ${currentRank.color}`}>
            <i className={`fa-solid ${currentRank.icon || 'fa-crown'} mr-2`}></i>Hạng {currentRank.name}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="bg-white/90 p-6 rounded-3xl shadow-sm border border-white mb-6 space-y-4 text-left animate-fade-in">
              <h4 className="text-size-1 font-black uppercase text-coffee-dark border-b border-gray-100 pb-2 mb-3">
                Chỉnh Sửa Thông Tin
              </h4>
              <div>
                <label className="block text-[0.75rem] font-bold text-gray-500 uppercase mb-1">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  value={formData.HoTen}
                  onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-size-1 font-bold text-coffee-dark focus:outline-none focus:border-coffee-green"
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.75rem] font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.SoDienThoai}
                    onChange={(e) => setFormData({ ...formData, SoDienThoai: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-size-1 font-bold text-coffee-dark focus:outline-none focus:border-coffee-green"
                    placeholder="SĐT..."
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-bold text-gray-500 uppercase mb-1">Giới tính</label>
                  <select
                    value={formData.GioiTinh}
                    onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-size-1 font-bold text-coffee-dark focus:outline-none focus:border-coffee-green"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-bold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-size-1 font-bold text-coffee-dark focus:outline-none focus:border-coffee-green"
                  placeholder="email@example.com..."
                />
              </div>
              <div>
                <label className="block text-[0.75rem] font-bold text-gray-500 uppercase mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.NgaySinh}
                  onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-size-1 font-bold text-coffee-dark focus:outline-none focus:border-coffee-green"
                />
              </div>
              <div>
                <label className="block text-[0.75rem] font-bold text-gray-500 uppercase mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={formData.DiaChi}
                  onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-size-1 font-bold text-coffee-dark focus:outline-none focus:border-coffee-green"
                  placeholder="Số nhà, đường, phường/xã..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="w-1/2 btn-secondary py-2.5 text-size-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 btn-primary py-2.5 text-size-1"
                >
                  {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-white mb-8 space-y-4 text-left">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-size-1 font-bold text-gray-500">Tên đăng nhập:</span>
                <span className="text-size-1 font-black text-coffee-dark">{user.TenDangNhap}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-size-1 font-bold text-gray-500">Số điện thoại:</span>
                <span className="text-size-1 font-black text-coffee-dark">{user.SoDienThoai || 'Chưa cập nhật'}</span>
              </div>
              {user.Email && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-size-1 font-bold text-gray-500">Email:</span>
                  <span className="text-size-1 font-black text-coffee-dark truncate max-w-[200px]" title={user.Email}>{user.Email}</span>
                </div>
              )}
              {user.GioiTinh && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-size-1 font-bold text-gray-500">Giới tính:</span>
                  <span className="text-size-1 font-black text-coffee-dark">{user.GioiTinh}</span>
                </div>
              )}
              {user.NgaySinh && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-size-1 font-bold text-gray-500">Ngày sinh:</span>
                  <span className="text-size-1 font-black text-coffee-dark">{user.NgaySinh}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-size-1 font-bold text-gray-500">Địa chỉ:</span>
                <span className="text-size-1 font-black text-coffee-dark text-right truncate w-2/3" title={user.DiaChi}>
                  {user.DiaChi || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-size-1 font-bold text-gray-500">Điểm tích lũy:</span>
                <span className="text-size-2 font-black text-coffee-yellow leading-none">{user.TongDiem || 0} đ</span>
              </div>

              {/* Progress bar to next tier */}
              {nextTierInfo.nextTier && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-[0.75rem] font-bold text-gray-500 mb-1">
                    <span>Tiến độ lên hạng {nextTierInfo.nextTier.name}:</span>
                    <span>{user.TongDiem || 0} / {nextTierInfo.nextTier.minPoints} đ</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-coffee-green to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${nextTierInfo.progressPercent}%` }}></div>
                  </div>
                  <p className="text-[0.7rem] text-gray-400 font-medium mt-1 italic">{nextTierInfo.message}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full btn-primary bg-coffee-green hover:bg-emerald-700 py-3 text-size-1 shadow-md"
              >
                <i className="fa-solid fa-pen-to-square mr-2"></i> Chỉnh Sửa Hồ Sơ
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full btn-danger py-3 text-size-1"
            >
              Đăng Xuất Tài Khoản
            </button>
          </div>
        </div>

        {/* Quyền lợi thành viên */}
        <div className="glass-effect p-8 md:p-10 rounded-[3rem] shadow-xl border border-white h-full flex flex-col justify-between">
          <div>
            <h3 className="text-size-1 font-black uppercase text-coffee-dark mb-6 tracking-widest">
              Quyền lợi hạng {currentRank.name}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/50">
                <div className="w-12 h-12 bg-coffee-yellow text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <i className="fa-solid fa-percent text-size-1"></i>
                </div>
                <div>
                  <p className="text-size-1 font-black text-coffee-dark">Giảm giá {currentRank.discount}%</p>
                  <p className="text-size-1 text-gray-500 font-medium">Áp dụng trực tiếp cho mọi đơn hàng online và tại quầy</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/50">
                <div className="w-12 h-12 bg-coffee-green text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <i className="fa-solid fa-gift text-size-1"></i>
                </div>
                <div>
                  <p className="text-size-1 font-black text-coffee-dark">Tích Điểm Mỗi Đơn</p>
                  <p className="text-size-1 text-gray-500 font-medium">Quy đổi: Mua mỗi 1.000đ được cộng ngay 1 điểm hội viên</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/50">
                <div className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <i className="fa-solid fa-motorcycle text-size-1"></i>
                </div>
                <div>
                  <p className="text-size-1 font-black text-coffee-dark">Giao Hàng Ưu Tiên</p>
                  <p className="text-size-1 text-gray-500 font-medium">Miễn phí giao hàng trong phạm vi bán kính 3km</p>
                </div>
              </div>
            </div>
          </div>
          <button
            className="w-full mt-8 btn-primary bg-gradient-to-r from-coffee-dark to-neutral-800 hover:from-coffee-dark hover:to-neutral-900 shadow-md py-3 text-size-1"
            onClick={() => setShowRankModal(true)}
          >
            <i className="fa-solid fa-list-ol"></i> Xem Bảng Xếp Hạng & Quy Chế
          </button>
        </div>
      </div>

      {/* Modal Bảng Xếp Hạng */}
      {showRankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-dark/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-effect p-6 md:p-8 rounded-[2.5rem] max-w-lg w-full border border-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowRankModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/50 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-gray-500 font-black text-size-1"
            >
              &times;
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-coffee-yellow to-amber-400 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-md">
                <i className="fa-solid fa-crown text-[2rem]"></i>
              </div>
              <h3 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter">
                Bảng Xếp Hạng Thành Viên
              </h3>
              <p className="text-[0.8rem] font-bold text-gray-500 mt-1">
                Tích điểm tự động: <span className="text-coffee-green font-black">1.000đ = 1 điểm</span>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {MEMBERSHIP_TIERS.map((t) => {
                const isCurrent = currentRank.id === t.id
                return (
                  <div key={t.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${isCurrent ? 'bg-coffee-green/10 border-coffee-green shadow-sm ring-2 ring-coffee-green/20' : 'bg-white/70 border-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${t.color}`}>
                        <i className={`fa-solid ${t.icon || 'fa-award'} text-[1rem]`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-size-1 font-black text-coffee-dark uppercase">{t.name}</span>
                          {isCurrent && <span className="text-[0.65rem] bg-coffee-green text-white font-black px-2 py-0.5 rounded-full uppercase">Hạng của bạn</span>}
                        </div>
                        <p className="text-[0.8rem] text-gray-500 font-medium">
                          {t.id === 6 ? '> 1.000 điểm' : `${t.minPoints} - ${t.maxPoints} điểm`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-size-1 font-black text-coffee-yellow">-{t.discount}%</span>
                      <p className="text-[0.7rem] text-gray-400 font-bold uppercase">Giảm giá</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setShowRankModal(false)}
              className="w-full btn-primary py-3 text-size-1"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProfileView
