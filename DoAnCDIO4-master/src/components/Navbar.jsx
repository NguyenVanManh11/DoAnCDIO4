import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = ({ cartCount, setCartOpen, user, setAuthModalOpen, setAuthModalMode, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Helper to determine active route
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/features') return 'features'
    if (path === '/menu') return 'menu'
    if (path === '/booking') return 'booking'
    if (path === '/history') return 'history'
    if (path === '/profile') return 'profile'
    return ''
  }

  const activeTab = getActiveTab()

  const tabs = [
    { id: 'home', label: 'Trang chủ', path: '/', icon: 'fa-house' },
    { id: 'features', label: 'Góc Đọc & Acoustic', path: '/features', icon: 'fa-guitar' },
    { id: 'menu', label: 'Thực đơn', path: '/menu', icon: 'fa-mug-hot' },
    { id: 'booking', label: 'Đặt bàn', path: '/booking', icon: 'fa-chair' },
    { id: 'history', label: 'Ưu đãi & Lịch sử', path: '/history', icon: 'fa-gift' },
  ]

  const handleNavClick = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-coffee-green/15 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 shrink-0" 
            onClick={() => handleNavClick('/')}
          >
            <div className="w-11 h-11 bg-coffee-green rounded-full flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-seedling text-lg"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-coffee-green uppercase leading-none">Heritage</span>
              <span className="text-[10px] font-extrabold tracking-widest text-coffee-yellow uppercase mt-0.5">Coffee & Tea</span>
            </div>
          </div>
          
          {/* Desktop Navigation Tabs (Center Pill) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-100/80 p-1.5 rounded-full shadow-inner border border-gray-200/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.path)}
                  className={`text-sm font-bold uppercase whitespace-nowrap px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/20'
                      : 'text-gray-600 hover:bg-white hover:text-coffee-green'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${isActive ? 'text-coffee-yellow' : 'text-gray-400 group-hover:text-coffee-green'}`}></i>
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {user && [1, 2, 3, 4, 5].includes(user.VaiTroID) && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-300 shadow-sm flex items-center gap-1.5 uppercase whitespace-nowrap"
                title="Về trang quản trị"
              >
                <i className="fa-solid fa-shield-halved"></i> Quản Trị
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="text-sm font-bold bg-white text-coffee-dark border border-coffee-green/30 px-5 py-2.5 rounded-full hover:bg-coffee-green hover:text-white hover:border-coffee-green hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm flex items-center gap-2 uppercase group"
            >
              <i className="fa-solid fa-basket-shopping text-coffee-green group-hover:text-white transition-colors text-base"></i> 
              <span>Giỏ</span>
              <span className="bg-coffee-green group-hover:bg-white text-white group-hover:text-coffee-green font-black text-xs px-2 py-0.5 rounded-full transition-colors">
                {cartCount}
              </span>
            </button>
            
            {user ? (
              <button
                onClick={() => handleNavClick('/profile')}
                className="text-sm font-bold bg-coffee-dark text-white px-5 py-2.5 rounded-full hover:bg-coffee-green hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center gap-2 uppercase"
              >
                <i className="fa-solid fa-user text-coffee-yellow"></i> {user.HoTen.split(' ').pop()}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                  className="text-sm font-bold bg-white text-coffee-green border border-coffee-green/30 px-4 py-2 rounded-full hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 uppercase shadow-sm whitespace-nowrap"
                >
                  Đăng Ký
                </button>
                <button
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                  className="text-sm font-bold bg-gradient-to-r from-coffee-yellow to-amber-500 text-coffee-dark px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-coffee-yellow/20 active:scale-95 transition-all duration-300 uppercase whitespace-nowrap"
                >
                  Đăng Nhập
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls (Cart + Hamburger Button) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="text-sm font-bold bg-white text-coffee-dark border border-coffee-green/30 px-3.5 py-2 rounded-full hover:bg-coffee-green hover:text-white transition-all duration-300 shadow-sm flex items-center gap-1.5 uppercase"
            >
              <i className="fa-solid fa-basket-shopping text-coffee-green"></i>
              <span className="bg-coffee-green text-white font-black text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-coffee-dark hover:bg-coffee-green hover:text-white transition-all duration-300 border border-gray-200/80 shadow-sm"
              aria-label="Toggle Menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark text-lg' : 'fa-bars text-base'}`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Hamburger Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
          {/* Mobile Navigation Links */}
          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.path)}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold uppercase transition-all duration-200 flex items-center justify-between ${
                    isActive
                      ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/15'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-coffee-green'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${isActive ? 'bg-white/20 text-coffee-yellow' : 'bg-gray-100 text-coffee-green'}`}>
                      <i className={`fa-solid ${tab.icon}`}></i>
                    </div>
                    <span className="text-sm tracking-wide">{tab.label}</span>
                  </div>
                  <i className={`fa-solid fa-chevron-right text-xs ${isActive ? 'text-white/70' : 'text-gray-300'}`}></i>
                </button>
              )
            })}
          </div>

          <div className="border-t border-gray-200/60 pt-3 mt-3"></div>

          {/* Mobile User / Auth Section */}
          <div className="space-y-2 pt-1">
            {user && [1, 2, 3, 4, 5].includes(user.VaiTroID) && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 uppercase"
              >
                <i className="fa-solid fa-shield-halved"></i> Quản Trị Hệ Thống
              </button>
            )}

            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="w-full text-sm font-bold bg-coffee-dark text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-center gap-2.5 uppercase"
                >
                  <i className="fa-solid fa-user text-coffee-yellow"></i>
                  <span>Tài Khoản: {user.HoTen}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-sm font-bold bg-white text-coffee-green border-2 border-coffee-green/30 px-4 py-3 rounded-2xl hover:bg-gray-50 uppercase tracking-wide text-center shadow-sm"
                >
                  Đăng Ký
                </button>
                <button
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-sm font-bold bg-gradient-to-r from-coffee-yellow to-amber-500 text-coffee-dark px-4 py-3 rounded-2xl shadow-md uppercase tracking-wide text-center"
                >
                  Đăng Nhập
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
