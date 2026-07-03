import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = ({ cartCount, setCartOpen, user, setAuthModalOpen, setAuthModalMode, onLogout, isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-coffee-green/15 dark:border-slate-800 shadow-sm py-0' : 'bg-transparent py-2'}`}>
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 xl:gap-4">
          
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
          <nav className="hidden xl:flex items-center space-x-0.5 xl:space-x-1 bg-gray-100/80 dark:bg-slate-800/80 p-1.5 rounded-full shadow-inner border border-gray-200/50 dark:border-slate-700/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.path)}
                  className={`text-[11px] xl:text-sm font-bold uppercase whitespace-nowrap px-3 xl:px-5 py-2 xl:py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 xl:gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 hover:text-coffee-green dark:hover:text-emerald-400'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${isActive ? 'text-coffee-yellow' : 'text-gray-400 group-hover:text-coffee-green'}`}></i>
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden xl:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
            {user && [1, 2, 3, 4, 5].includes(user.VaiTroID) && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="text-[11px] xl:text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 xl:px-4 py-2 xl:py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-300 shadow-sm flex items-center gap-1.5 uppercase whitespace-nowrap"
                title="Về trang quản trị"
              >
                <i className="fa-solid fa-shield-halved"></i> Quản Trị
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="text-[11px] xl:text-sm font-bold bg-white dark:bg-slate-800 text-coffee-dark dark:text-gray-200 border border-coffee-green/30 dark:border-slate-600 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full hover:bg-coffee-green dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white hover:border-coffee-green dark:hover:border-emerald-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm flex items-center gap-1.5 xl:gap-2 uppercase group"
            >
              <i className="fa-solid fa-basket-shopping text-coffee-green group-hover:text-white transition-colors text-sm xl:text-base"></i> 
              <span>Giỏ</span>
              <span className="bg-coffee-green group-hover:bg-white text-white group-hover:text-coffee-green font-black text-[10px] xl:text-xs px-2 py-0.5 rounded-full transition-colors">
                {cartCount}
              </span>
            </button>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-[11px] xl:text-sm font-bold bg-white dark:bg-slate-800 text-coffee-dark dark:text-gray-200 border border-coffee-green/30 dark:border-slate-600 px-3 xl:px-4 py-2 xl:py-2.5 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11"
              title="Giao diện sáng/tối"
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'} text-base`}></i>
            </button>
            
            {user ? (
              <button
                onClick={() => handleNavClick('/profile')}
                className="text-[11px] xl:text-sm font-bold bg-coffee-dark text-white px-3 xl:px-5 py-2 xl:py-2.5 rounded-full hover:bg-coffee-green hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center gap-1.5 xl:gap-2 uppercase"
              >
                <i className="fa-solid fa-user text-coffee-yellow"></i> {user.HoTen.split(' ').pop()}
              </button>

            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <button
                  onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                  className="text-[11px] xl:text-sm font-bold bg-white dark:bg-slate-800 text-coffee-green dark:text-emerald-400 border border-coffee-green/30 dark:border-slate-600 px-3 xl:px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-300 uppercase shadow-sm whitespace-nowrap"
                >
                  Đăng Ký
                </button>
                <button
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                  className="text-[11px] xl:text-sm font-bold bg-gradient-to-r from-coffee-yellow to-amber-500 text-coffee-dark px-3 xl:px-5 py-2 xl:py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-coffee-yellow/20 active:scale-95 transition-all duration-300 uppercase whitespace-nowrap"
                >
                  Đăng Nhập
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls (Cart + Hamburger Button) */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-coffee-dark dark:text-gray-200 hover:bg-coffee-green dark:hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-gray-200/80 dark:border-slate-700 shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'} text-base`}></i>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="text-sm font-bold bg-white dark:bg-slate-800 text-coffee-dark dark:text-gray-200 border border-coffee-green/30 dark:border-slate-600 px-3.5 py-2 rounded-full hover:bg-coffee-green hover:text-white transition-all duration-300 shadow-sm flex items-center gap-1.5 uppercase"
            >
              <i className="fa-solid fa-basket-shopping text-coffee-green"></i>
              <span className="bg-coffee-green text-white font-black text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-coffee-dark dark:text-gray-200 hover:bg-coffee-green dark:hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-gray-200/80 dark:border-slate-700 shadow-sm"
              aria-label="Toggle Menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark text-lg' : 'fa-bars text-base'}`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Hamburger Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
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
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800 hover:text-coffee-green dark:hover:text-emerald-400'
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
                  className="w-full text-sm font-bold bg-white dark:bg-slate-800 text-coffee-green dark:text-emerald-400 border-2 border-coffee-green/30 dark:border-slate-700 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 uppercase tracking-wide text-center shadow-sm"
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
