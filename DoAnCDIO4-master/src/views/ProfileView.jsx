import React from 'react'

const ProfileView = ({ user, onLogout }) => {
  if (!user) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <h2 className="text-size-2 font-black uppercase text-gray-500">
          Vui lòng đăng nhập để xem thông tin
        </h2>
      </div>
    )
  }

  return (
    <section className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
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
          <div className="inline-block bg-green-50 text-coffee-green px-5 py-2 rounded-full text-size-1 font-black mb-6 border border-green-100 uppercase tracking-widest">
            <i className="fa-solid fa-crown mr-2"></i>Hạng {user.TenHang || 'Silver'}
          </div>
          
          <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-white mb-8 space-y-4 text-left">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-size-1 font-bold text-gray-500">Tên đăng nhập:</span>
              <span className="text-size-1 font-black text-coffee-dark">{user.TenDangNhap}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-size-1 font-bold text-gray-500">Số điện thoại:</span>
              <span className="text-size-1 font-black text-coffee-dark">{user.SoDienThoai || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-size-1 font-bold text-gray-500">Địa chỉ giao hàng:</span>
              <span className="text-size-1 font-black text-coffee-dark text-right truncate w-2/3" title={user.DiaChi}>
                {user.DiaChi || 'Chưa cập nhật'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-size-1 font-bold text-gray-500">Điểm tích lũy:</span>
              <span className="text-size-2 font-black text-coffee-yellow leading-none">{user.TongDiem || 0}</span>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full btn-danger py-3 text-size-1"
          >
            Đăng Xuất Tài Khoản
          </button>
        </div>

        {/* Quyền lợi thành viên */}
        <div className="glass-effect p-8 md:p-10 rounded-[3rem] shadow-xl border border-white h-full">
          <h3 className="text-size-1 font-black uppercase text-coffee-dark mb-6 tracking-widest">
            Quyền lợi hạng {user.TenHang || 'Silver'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/50">
              <div className="w-12 h-12 bg-coffee-yellow text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <i className="fa-solid fa-percent text-size-1"></i>
              </div>
              <div>
                <p className="text-size-1 font-black text-coffee-dark">Giảm giá {user.GiamGia || 0}%</p>
                <p className="text-size-1 text-gray-500 font-medium">Áp dụng trực tiếp cho mọi đơn hàng online và tại quầy</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/50">
              <div className="w-12 h-12 bg-coffee-green text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <i className="fa-solid fa-gift text-size-1"></i>
              </div>
              <div>
                <p className="text-size-1 font-black text-coffee-dark">Quà Tặng Sinh Nhật</p>
                <p className="text-size-1 text-gray-500 font-medium">Nhận 1 bánh ngọt tự chọn miễn phí vào tháng sinh nhật</p>
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
          <button
            className="w-full mt-8 btn-primary bg-gradient-to-r from-coffee-dark to-neutral-800 hover:from-coffee-dark hover:to-neutral-900 shadow-md py-3 text-size-1"
            onClick={() => alert('Xếp Hạng Thành Viên:\n1. Silver (0-999đ) - Giảm 0%\n2. Gold (1000-4999đ) - Giảm 5%\n3. Diamond (>=5000đ) - Giảm 10%')}
          >
            <i className="fa-solid fa-list-ol"></i> Xem Bảng Xếp Hạng
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProfileView
