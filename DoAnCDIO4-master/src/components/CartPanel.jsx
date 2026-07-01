import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const VOUCHERS = [
  { code: 'GIAM10K', discount: 10000, type: 'TienMat' }
]

const CartPanel = ({ isOpen, onClose, cart, removeFromCart, checkout, user, tableParam }) => {
  const [orderType, setOrderType] = useState(tableParam ? 'Tại Quán' : 'Tại Quán')
  const [voucher, setVoucher] = useState('')
  const [discount, setDiscount] = useState(0)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setPhone(user.SoDienThoai || '')
      setAddress(user.DiaChi || '')
    }
  }, [user, isOpen])

  if (!isOpen) return null

  const subTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0)
  const userDiscountPercent = user ? (user.GiamGia || 0) : 0
  const userDiscountAmount = (subTotal * userDiscountPercent) / 100
  const finalTotal = Math.max(0, subTotal - userDiscountAmount - discount)

  const handleApplyVoucher = () => {
    const found = VOUCHERS.find(v => v.code === voucher.toUpperCase())
    if (found) {
      setDiscount(found.discount)
    } else {
      setDiscount(0)
      alert('Mã giảm giá không hợp lệ!')
    }
  }

  const handleCheckoutSubmit = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng!')
      return
    }

    setLoading(true)
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    const orderCode = 'DH' + Date.now().toString().slice(-6)
    
    // Map order type
    let loaiDonHangId = 1
    if (orderType === 'Mang Đi') loaiDonHangId = 2
    if (orderType === 'Giao Hàng') loaiDonHangId = 3

    let dbOrderId = null

    try {
      if (isConfigured) {
        // 1. Insert order to donhang
        const { data: orderData, error: orderError } = await supabase
          .from('donhang')
          .insert({
            MaDonHang: orderCode,
            KhachHangID: user.NguoiDungID,
            BanID: (tableParam && orderType === 'Tại Quán') ? parseInt(tableParam) : null,
            TongTien: subTotal,
            GiamGia: userDiscountAmount + discount,
            ThanhTien: finalTotal,
            PhuongThucThanhToan: orderType === 'Giao Hàng' ? 'ChuyenKhoan' : 'TienMat',
            TrangThai: 'ChoXacNhan',
            LoaiDonHangID: loaiDonHangId,
            GhiChu: orderType === 'Giao Hàng' ? `SĐT: ${phone}. Địa chỉ: ${address}` : (tableParam ? `Quét QR từ Bàn ${tableParam}` : 'Đặt tại quầy')
          })
          .select()
          .single()

        if (orderError) throw orderError
        dbOrderId = orderData.DonHangID

        // 2. Insert items to chitietdonhang
        for (const item of cart) {
          // Resolve Size ID (Fallback to size S if not present or cake)
          let sizeId = 1
          if (item.DanhMucID === 1) { // Coffee sizes
            if (item.selectedSize?.id === 'M') sizeId = 2
            if (item.selectedSize?.id === 'L') sizeId = 3
            if (item.SanPhamID === 2) { // Bac xiu
              sizeId = item.selectedSize?.id === 'M' ? 5 : item.selectedSize?.id === 'L' ? 6 : 4
            } else if (item.SanPhamID === 5) { // Espresso
              sizeId = item.selectedSize?.id === 'M' ? 12 : item.selectedSize?.id === 'L' ? 13 : 11
            }
          } else if (item.DanhMucID === 2) { // Tea sizes
            if (item.SanPhamID === 3) sizeId = item.selectedSize?.id === 'M' ? 8 : item.selectedSize?.id === 'L' ? 9 : 7
            if (item.SanPhamID === 6) sizeId = item.selectedSize?.id === 'M' ? 15 : item.selectedSize?.id === 'L' ? 16 : 14
          } else if (item.DanhMucID === 3) { // Cake sizes
            if (item.SanPhamID === 4) sizeId = 10
            if (item.SanPhamID === 7) sizeId = 17
          }

          const { data: detailData, error: detailError } = await supabase
            .from('chitietdonhang')
            .insert({
              DonHangID: dbOrderId,
              SanPhamSizeID: sizeId,
              SoLuong: item.quantity,
              DonGia: item.Gia,
              ThanhTien: item.finalPrice * item.quantity,
              GhiChu: item.selectedToppings?.map(t => t.name).join(', ') || ''
            })
            .select()
            .single()

          if (detailError) throw detailError

          // 3. Insert toppings if any
          if (item.selectedToppings?.length > 0 && detailData) {
            const detailId = detailData.ChiTietDonHangID
            for (const t of item.selectedToppings) {
              const { error: toppingError } = await supabase
                .from('chitiettopping')
                .insert({
                  ChiTietDonHangID: detailId,
                  ToppingID: t.id
                })
              if (toppingError) throw toppingError
            }
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi ghi đơn hàng vào Supabase:', err.message)
    }

    // Call checkout callback
    checkout(finalTotal, orderType, { phone, address, code: orderCode, id_db: dbOrderId })
    setLoading(false)
  }

  const isCheckoutDisabled = cart.length === 0 || (orderType === 'Giao Hàng' && (!phone.trim() || !address.trim()))

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-2 sm:p-6">
      <div className="absolute inset-0 bg-coffee-dark/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-[95vh] md:h-auto md:max-h-[85vh] glass-effect rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:left-6 w-10 h-10 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded-full text-size-1 font-black text-gray-500 hover:text-coffee-dark z-20 hover:scale-105 transition-transform"
        >
          &times;
        </button>

        {/* Cột trái: Giỏ hàng & Cấu hình Giao Nhận */}
        <div className="flex-1 flex flex-col min-h-0 bg-white/40 border-r border-white/50">
          <div className="p-6 pt-16 md:pt-6 md:pl-20 shrink-0">
            <h2 className="text-size-2 font-black text-coffee-dark uppercase tracking-tighter mb-4">Giỏ Hàng</h2>
            
            <div className="flex gap-2 bg-white/60 p-1.5 rounded-full shadow-inner border border-white mb-2">
              {['Tại Quán', 'Mang Đi', 'Giao Hàng'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-2 text-size-1 font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${
                    orderType === type 
                      ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-sm shadow-coffee-green/15' 
                      : 'text-gray-600 hover:bg-white/80 hover:text-coffee-green'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            {orderType === 'Giao Hàng' && (
              <div className="mt-2 p-3 bg-white/80 rounded-2xl border border-white shadow-sm space-y-2">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-coffee-green">
                  <i className="fa-solid fa-phone text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Số điện thoại người nhận..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border-none text-size-1 font-medium outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-coffee-green">
                  <i className="fa-solid fa-location-dot text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Địa chỉ giao hàng..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-transparent border-none text-size-1 font-medium outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-0 md:pl-20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-10">
                <i className="fa-solid fa-basket-shopping text-size-2 mb-4"></i>
                <p className="text-size-1 font-bold">Chưa có món nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex bg-white/80 p-4 rounded-2xl shadow-sm border border-white items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-coffee-green shrink-0">
                      <i className={`fa-solid ${item.icon || 'fa-mug-hot'} text-size-1`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-size-1 font-black text-coffee-dark truncate">{item.TenSanPham}</p>
                      <p className="text-size-1 font-medium text-gray-500 truncate">
                        {item.selectedSize ? `Size ${item.selectedSize.id}` : ''} 
                        {item.selectedToppings?.length > 0 ? ` + ${item.selectedToppings.map(t => t.name).join(', ')}` : ''}
                      </p>
                      <p className="text-size-1 font-bold text-coffee-green">SL: {item.quantity} x {item.finalPrice.toLocaleString()}đ</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Thanh Toán */}
        <div className="w-full md:w-[40%] bg-white p-6 md:p-8 flex flex-col shrink-0">
          <h3 className="text-size-1 font-black uppercase text-gray-400 tracking-widest mb-6">Thanh Toán</h3>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Mã Voucher..."
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-gray-50 border border-gray-100 text-size-1 font-bold uppercase outline-none"
            />
            <button
              onClick={handleApplyVoucher}
              className="btn-secondary py-2.5 px-5 text-size-0"
            >
              Áp dụng
            </button>
          </div>

          <div className="space-y-4 mb-6 flex-1">
            <div className="flex justify-between text-size-1 font-bold text-gray-600">
              <span>Tạm tính:</span>
              <span>{subTotal.toLocaleString()}đ</span>
            </div>
            {user && (
              <div className="flex justify-between text-size-1 font-bold text-coffee-green">
                <span>Hạng {user.TenHang} (-{user.GiamGia}%):</span>
                <span>-{userDiscountAmount.toLocaleString()}đ</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-size-1 font-bold text-coffee-green">
                <span>Voucher:</span>
                <span>-{discount.toLocaleString()}đ</span>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t-2 border-gray-100 border-dashed shrink-0">
            <div className="flex justify-between items-end mb-4">
              <span className="text-size-1 font-black text-gray-400 uppercase tracking-widest">Tổng Cộng</span>
              <span className="text-coffee-green text-size-2 font-black leading-none">{finalTotal.toLocaleString()}đ</span>
            </div>
            <button
              onClick={handleCheckoutSubmit}
              disabled={isCheckoutDisabled || loading}
              className={`w-full py-3.5 text-size-1 ${
                isCheckoutDisabled || loading ? 'btn-inactive' : 'btn-primary'
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i> Đang Xử Lý...
                </>
              ) : orderType === 'Giao Hàng' && (!phone || !address) ? (
                'Nhập Đủ TT Giao'
              ) : user ? (
                'Xác Nhận Đặt'
              ) : (
                'Đăng Nhập Để Đặt'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPanel
