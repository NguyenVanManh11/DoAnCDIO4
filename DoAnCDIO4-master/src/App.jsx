import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { getMembershipRank, calculateOrderPoints } from './utils/membershipUtils'

// Layout & Modals
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import ProductModal from './components/ProductModal'
import ReviewModal from './components/ReviewModal'
import CartPanel from './components/CartPanel'

// Client Views
import HomeView from './views/HomeView'
import FeaturesView from './views/FeaturesView'
import MenuView from './views/MenuView'
import BookingView from './views/BookingView'
import HistoryView from './views/HistoryView'
import ProfileView from './views/ProfileView'

// Admin Layout
import AdminLayout from './admin/AdminLayout'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Extract table ID if accessed via QR Code
  const queryParams = new URLSearchParams(location.search)
  const tableParam = queryParams.get('table')

  // App States
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('coffee_user')
    return saved ? JSON.parse(saved) : null
  })
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Review Modal triggers
  const [activeReview, setActiveReview] = useState(null) // { order, item }
  const [reviews, setReviews] = useState({}) // Key: orderCode-productId, value: {rating, comment}

  // Global Notification Banner
  const [notification, setNotification] = useState('')

  const showNotify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    localStorage.setItem('coffee_user', JSON.stringify(loggedUser))
    setAuthModalOpen(false)
    showNotify(`Chào mừng quay trở lại, ${loggedUser.HoTen}!`)

    // Redirect if it's an admin/staff logging in
    if ([1, 2, 3, 4, 5].includes(loggedUser.VaiTroID)) {
      navigate('/admin')
    }
  }

  // Protect specific routes from guests
  useEffect(() => {
    const isProtectedRoute = ['/history', '/profile'].includes(location.pathname)
    if (!user && isProtectedRoute) {
      navigate('/')
      setAuthModalMode('login')
      setAuthModalOpen(true)
      showNotify('Vui lòng đăng nhập để sử dụng tính năng này!')
    }
  }, [user, location.pathname, navigate])

  // Realtime order status notifications for customers
  useEffect(() => {
    if (!user || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return

    const channelOrder = supabase
      .channel(`customer_order_notify_${user.NguoiDungID}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'donhang',
          filter: `KhachHangID=eq.${user.NguoiDungID}`
        },
        (payload) => {
          const newRow = payload.new
          const oldRow = payload.old
          if (newRow && oldRow && newRow.TrangThai !== oldRow.TrangThai) {
            if (newRow.TrangThai === 'DangGiao') {
              showNotify(`🚚 Đơn hàng #${newRow.MaDonHang || newRow.DonHangID} đang được giao đến bạn!`)
            } else if (newRow.TrangThai === 'HoanThanh') {
              showNotify(`✅ Đơn hàng #${newRow.MaDonHang || newRow.DonHangID} đã giao thành công và nhận hàng!`)
            } else if (newRow.TrangThai === 'DangPhaChe') {
              showNotify(`☕ Đơn hàng #${newRow.MaDonHang || newRow.DonHangID} đang được pha chế!`)
            } else if (newRow.TrangThai === 'DaHuy') {
              showNotify(`❌ Đơn hàng #${newRow.MaDonHang || newRow.DonHangID} đã bị hủy.`)
            }
          }
        }
      )
      .subscribe()

    const channelBooking = supabase
      .channel(`customer_booking_notify_${user.NguoiDungID}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'datban',
          filter: `KhachHangID=eq.${user.NguoiDungID}`
        },
        (payload) => {
          const newRow = payload.new
          const oldRow = payload.old
          if (newRow && oldRow && newRow.TrangThai !== oldRow.TrangThai) {
            if (newRow.TrangThai === 'DaXacNhan') {
              showNotify(`🎉 Yêu cầu đặt bàn của bạn đã được nhà hàng xác nhận thành công!`)
            } else if (newRow.TrangThai === 'DaHuy') {
              showNotify(`❌ Yêu cầu đặt bàn của bạn đã bị từ chối/hủy. Vui lòng liên hệ quán để biết chi tiết.`)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelOrder)
      supabase.removeChannel(channelBooking)
    }
  }, [user])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('coffee_user')
    showNotify('Đã đăng xuất tài khoản!')
    navigate('/')
  }

  const addToCart = (item) => {
    setCart((prev) => {
      // Find matching item (same ID, size, and toppings)
      const matches = prev.findIndex(
        (c) =>
          c.SanPhamID === item.SanPhamID &&
          c.selectedSize?.id === item.selectedSize?.id &&
          JSON.stringify(c.selectedToppings) === JSON.stringify(item.selectedToppings)
      )

      if (matches > -1) {
        const copy = [...prev]
        copy[matches].quantity += item.quantity
        return copy
      }
      return [...prev, item]
    })
    showNotify(`Đã thêm ${item.TenSanPham} vào giỏ hàng!`)
  }

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId))
  }

  const handleCheckout = (totalAmount, orderType, deliveryInfo) => {
    setCart([])
    setCartOpen(false)

    let completionMessage = `Đặt đơn ${deliveryInfo.code} thành công! Giá trị: ${totalAmount.toLocaleString()}đ.`
    
    if (user) {
      const earnedPoints = calculateOrderPoints(totalAmount)
      const newPoints = (user.TongDiem || 0) + earnedPoints
      const newRank = getMembershipRank(newPoints)
      
      const updatedUser = {
        ...user,
        TongDiem: newPoints,
        HangThanhVienID: newRank.id,
        TenHang: newRank.name,
        GiamGia: newRank.discount
      }
      setUser(updatedUser)
      localStorage.setItem('coffee_user', JSON.stringify(updatedUser))
      completionMessage += ` 🎁 Bạn đã tích lũy thêm +${earnedPoints} điểm (Hạng ${newRank.name})!`
    }

    if (orderType === 'Giao Hàng') {
      completionMessage += ` Đồ uống sẽ được giao tới SĐT: ${deliveryInfo.phone}.`
    } else {
      completionMessage += ' Vui lòng chờ nhận món tại quầy bar.'
    }

    showNotify(completionMessage)
    navigate('/history')
  }

  const handleReviewSubmit = (orderId, productId, ratingData) => {
    setReviews((prev) => ({
      ...prev,
      [`${orderId}-${productId}`]: ratingData
    }))
    setActiveReview(null)
    showNotify('Cảm ơn bạn đã gửi đánh giá cho đồ uống!')
  }

  const isAdminRoute = location.pathname.startsWith('/admin')

  // Render Admin panel cleanly separated from customer interfaces
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout onLogout={handleLogout} />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
      {/* Grid Caro Background */}
      <div className="bg-grid-pattern fixed inset-0 -z-20"></div>

      {/* Alert Notification Banner */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-coffee-dark/95 backdrop-blur-md text-white text-size-1 font-black py-4 px-8 rounded-full border-2 border-coffee-yellow shadow-2xl text-center w-max animate-bounce max-w-[90vw]">
          <i className="fa-solid fa-bell text-coffee-yellow mr-2"></i> {notification}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        setCartOpen={setCartOpen}
        user={user}
        setAuthModalOpen={setAuthModalOpen}
        setAuthModalMode={setAuthModalMode}
        onLogout={handleLogout}
      />

      {/* Main Routes */}
      <div className="flex-1 w-full flex flex-col justify-start">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/features" element={<FeaturesView />} />
          <Route path="/menu" element={<MenuView onProductSelect={setSelectedProduct} />} />
          <Route
            path="/booking"
            element={
              <BookingView
                user={user}
                showNotify={showNotify}
                onRequireLogin={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/history"
            element={
              <HistoryView
                user={user}
                reviews={reviews}
                onOpenReview={(order, item) => setActiveReview({ order, item })}
                showNotify={showNotify}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileView
                user={user}
                onLogout={handleLogout}
                onUpdateUser={(updated) => {
                  setUser(updated)
                  localStorage.setItem('coffee_user', JSON.stringify(updated))
                  showNotify('Đã cập nhật thông tin cá nhân thành công!')
                }}
                showNotify={showNotify}
              />
            }
          />
        </Routes>
      </div>

      {/* Bottom Footer */}
      <Footer />

      {/* Modals & Sidebar Panels */}
      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)} 
          onLogin={handleLogin} 
          initialMode={authModalMode}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {activeReview && (
        <ReviewModal
          order={activeReview.order}
          item={activeReview.item}
          user={user}
          onClose={() => setActiveReview(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        checkout={handleCheckout}
        user={user}
        tableParam={tableParam}
      />
    </div>
  )
}

export default App
