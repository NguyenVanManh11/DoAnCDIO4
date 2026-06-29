import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = ({ cartCount, setCartOpen, user, setAuthModalOpen, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Helper to determine active route
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/menu') return 'menu'
    if (path === '/booking') return 'booking'
    if (path === '/history') return 'history'
    if (path === '/profile') return 'profile'
    return ''
  }

  const activeTab = getActiveTab()

  const tabs = [
    { id: 'home', label: 'Trang chủ', path: '/' },
    { id: 'menu', label: 'Thực đơn', path: '/menu' },
    { id: 'booking', label: 'Đặt bàn', path: '/booking' },
    { id: 'history', label: 'Lịch sử', path: '/history' },
  ]

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center py-4 px-6 md:px-12 bg-white/60 backdrop-blur-md border-b border-coffee-grid/30 sticky top-0 z-30 gap-4 transition-all duration-300">
      {/* Logo */}
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300" 
        onClick={() => navigate('/')}
      >
        <div className="w-11 h-11 bg-coffee-green rounded-full flex items-center justify-center text-white shadow-md">
          <i className="fa-solid fa-seedling text-size-2"></i>
        </div>
        <span className="text-size-2 font-black tracking-tighter text-coffee-green uppercase">Heritage</span>
      </div>
      
      {/* Navigation tabs */}
      <div className="flex items-center space-x-1 bg-white/60 p-1.5 rounded-full shadow-inner border border-white/80 overflow-x-auto no-scrollbar w-full md:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`text-size-1 font-bold uppercase whitespace-nowrap px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-sm shadow-coffee-green/15'
                : 'text-gray-600 hover:bg-white/85 hover:text-coffee-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
 
      {/* Cart & Profile Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setCartOpen(true)}
          className="text-size-1 font-bold bg-white text-coffee-dark border border-coffee-grid/40 px-5 py-2.5 rounded-full hover:bg-coffee-green hover:text-white hover:border-coffee-green hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm flex items-center gap-2 uppercase"
        >
          <i className="fa-solid fa-basket-shopping text-coffee-green group-hover:text-white transition-colors"></i> Giỏ ({cartCount})
        </button>
        
        {user ? (
          <button
            onClick={() => navigate('/profile')}
            className="text-size-1 font-bold bg-coffee-dark text-white px-5 py-2.5 rounded-full hover:bg-coffee-green hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center gap-2 uppercase"
          >
            <i className="fa-solid fa-user text-coffee-yellow"></i> {user.HoTen.split(' ').pop()}
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="text-size-1 font-bold bg-gradient-to-r from-coffee-yellow to-amber-500 text-coffee-dark px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-coffee-yellow/20 active:scale-95 transition-all duration-300 uppercase"
          >
            Đăng Nhập
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
