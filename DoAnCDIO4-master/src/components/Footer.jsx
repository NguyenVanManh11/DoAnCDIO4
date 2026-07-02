import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-coffee-dark p-8 md:p-12 text-white z-20 mt-auto border-t-[6px] border-coffee-green shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

      {/* Brand Info */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-coffee-green rounded-full flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-seedling text-[1.2rem]"></i>
          </div>
          <span className="text-[1.5rem] font-black tracking-tighter text-coffee-yellow uppercase">Heritage</span>
        </div>
        <p className="text-gray-400 text-sm font-medium leading-relaxed">
          Hệ thống quản lý thông minh 2026.<br />
          Mang đến trải nghiệm cà phê tuyệt vời nhất với không gian lý tưởng và hương vị đậm đà.
        </p>
      </div>

      {/* Address & Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase text-coffee-green tracking-widest">Liên Hệ</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <i className="fa-solid fa-location-dot mt-1 text-coffee-yellow"></i>
            <span>123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh</span>
          </li>
          <li className="flex items-center gap-3">
            <i className="fa-solid fa-phone text-coffee-yellow"></i>
            <span>Hotline: 1900 1234</span>
          </li>
          <li className="flex items-center gap-3">
            <i className="fa-solid fa-envelope text-coffee-yellow"></i>
            <span>Email: contact@heritagecoffee.vn</span>
          </li>
        </ul>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase text-coffee-green tracking-widest">Kết Nối Với Chúng Tôi</h3>
        <p className="text-sm text-gray-400 mb-4">Theo dõi để nhận ngay những ưu đãi hấp dẫn!</p>
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transition-all duration-300">
            <i className="fa-brands fa-facebook-f text-lg"></i>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-black hover:scale-110 transition-all duration-300">
            <i className="fa-brands fa-tiktok text-lg"></i>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 hover:scale-110 transition-all duration-300">
            <i className="fa-brands fa-instagram text-lg"></i>
          </a>
        </div>
      </div>

    </div>

    <div className="mt-8 pt-6 border-t border-white/10 text-center">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Heritage Coffee & Tea. All rights reserved.
      </p>
    </div>
  </footer>
  )
}

export default Footer
