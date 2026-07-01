import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'

// Views
import DashboardView from './DashboardView'
import OrdersView from './OrdersView'
import TablesView from './TablesView'
import ProductsView from './ProductsView'
import UsersView from './UsersView'
import ReportsView from './ReportsView'
import SettingsView from './SettingsView'
import VoucherView from './VoucherView'
import InventoryView from './InventoryView'
import StaffView from './StaffView'
import RecipeView from './RecipeView'

const AdminLayout = ({ onLogout }) => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('coffee_user')
    return saved ? JSON.parse(saved) : null
  })
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notification, setNotification] = useState('')
  const [globalScale, setGlobalScale] = useState(16)

  // Sync scale settings
  useEffect(() => {
    document.documentElement.style.fontSize = `${globalScale}px`
    return () => {
      // Reset scale when leaving admin panel
      document.documentElement.style.fontSize = '16px'
    }
  }, [globalScale])

  const showNotify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleLogin = (adminUser) => {
    setAdmin(adminUser)
    localStorage.setItem('coffee_user', JSON.stringify(adminUser))
    showNotify(`Xin chào admin: ${adminUser.HoTen}!`)
  }

  const handleLogout = () => {
    setAdmin(null)
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('coffee_user')
      window.location.href = '/'
    }
  }

  if (!admin || ![1, 2, 3, 4, 5].includes(admin.VaiTroID)) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div className="bg-grid-pattern fixed inset-0 -z-20"></div>
        <AuthModal onClose={() => window.location.href = '/'} onLogin={handleLogin} isAdminMode={true} />
      </div>
    )
  }

  const menu = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Tổng Quan' },
    { id: 'orders', icon: 'fa-receipt', label: 'Đơn Hàng' },
    { id: 'tables', icon: 'fa-chair', label: 'Sơ Đồ Bàn' },
    { id: 'products', icon: 'fa-box', label: 'Sản Phẩm' },
    { id: 'inventory', icon: 'fa-warehouse', label: 'Kho Hàng' },
    { id: 'recipes', icon: 'fa-flask', label: 'Định Lượng' },
    { id: 'vouchers', icon: 'fa-ticket', label: 'Khuyến Mãi' },
    { id: 'staff', icon: 'fa-user-tie', label: 'Nhân Sự' },
    { id: 'users', icon: 'fa-users', label: 'Khách Hàng' },
    { id: 'reports', icon: 'fa-chart-column', label: 'Báo Cáo' },
    { id: 'settings', icon: 'fa-gear', label: 'Cài Đặt' },
  ]

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:p-3 bg-coffee-bg transition-all duration-300">
      <div className="bg-grid-pattern fixed inset-0 -z-20"></div>

      <div className="flex-1 w-full max-w-[1400px] mx-auto bg-white/30 backdrop-blur-2xl md:rounded-[2.5rem] border border-white shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-300">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 glass-effect border-r border-white/50 flex flex-col shrink-0 h-auto md:h-full md:rounded-l-[2.5rem] z-20">
          <div className="p-6 flex items-center gap-3 border-b border-white/50 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 bg-coffee-green rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <i className="fa-solid fa-seedling text-size-1"></i>
            </div>
            <div>
              <span className="text-size-2 font-black tracking-tighter text-coffee-dark uppercase leading-none block">Admin</span>
              <span className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest block mt-0.5">Heritage Coffee</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex md:flex-col gap-1">
            {menu.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap ${
                  activeTab === item.id 
                    ? 'bg-white shadow-sm border border-gray-100/60 font-black text-coffee-dark' 
                    : 'hover:bg-white/50 text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  activeTab === item.id ? 'bg-coffee-green text-white shadow-sm' : 'bg-gray-100'
                }`}>
                  <i className={`fa-solid ${item.icon} text-size-0`}></i>
                </div>
                <span className="text-size-0 font-bold uppercase tracking-wider hidden md:block">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Logout & Navigation back to site */}
          <div className="p-4 border-t border-white/50 flex flex-col gap-2">
            <button 
              onClick={() => navigate('/')} 
              className="w-full btn-secondary py-2 px-4 text-size-0"
            >
              <i className="fa-solid fa-house"></i> Về Trang Khách
            </button>
            <button 
              onClick={handleLogout} 
              className="w-full btn-danger py-2 px-4 text-size-0"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Đăng Xuất
            </button>
          </div>
        </div>

        {/* Content container */}
        <div className="flex-1 relative z-10 w-full h-full overflow-hidden flex flex-col bg-white/40">
          {notification && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-coffee-dark/90 backdrop-blur-md text-white text-size-1 font-bold py-3 px-6 rounded-full border border-coffee-yellow animate-bounce shadow-xl text-center w-max">
              {notification}
            </div>
          )}

          <div className="flex-1 overflow-hidden relative">
            { activeTab === 'dashboard' && <DashboardView /> }
            { activeTab === 'orders' && <OrdersView showNotify={showNotify} /> }
            { activeTab === 'tables' && <TablesView showNotify={showNotify} /> }
            { activeTab === 'products' && <ProductsView showNotify={showNotify} /> }
            { activeTab === 'inventory' && <InventoryView showNotify={showNotify} /> }
            { activeTab === 'recipes' && <RecipeView showNotify={showNotify} /> }
            { activeTab === 'vouchers' && <VoucherView showNotify={showNotify} /> }
            { activeTab === 'staff' && <StaffView showNotify={showNotify} /> }
            { activeTab === 'users' && <UsersView showNotify={showNotify} /> }
            { activeTab === 'reports' && <ReportsView /> }
            {activeTab === 'settings' && (
              <SettingsView 
                globalScale={globalScale} 
                setGlobalScale={setGlobalScale} 
                showNotify={showNotify} 
              />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminLayout
