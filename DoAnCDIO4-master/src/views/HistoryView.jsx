import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const OFFERS = [
  {
    id: 1,
    code: 'GIAM10K',
    title: 'Giảm Ngay 10.000đ Cho Mọi Đơn',
    desc: 'Áp dụng cho đơn hàng có giá trị từ 20.000đ trở lên. Nhập mã tại giỏ hàng khi thanh toán.',
    discountText: '-10K',
    minOrder: 'Đơn từ 20K',
    badge: 'Phổ Thông',
    color: 'from-amber-500 to-orange-500',
    icon: 'fa-ticket',
    expiry: 'HSD: 31/08/2026'
  },
  {
    id: 2,
    code: 'GIAM10PT',
    title: 'Giảm 10% Tối Đa 30.000đ',
    desc: 'Áp dụng cho đơn hàng từ 50.000đ. Cực hời khi đặt nước cho nhóm bạn bè, đồng nghiệp.',
    discountText: '-10%',
    minOrder: 'Đơn từ 50K',
    badge: 'Cực Hot',
    color: 'from-red-500 to-pink-600',
    icon: 'fa-fire',
    expiry: 'HSD: 30/09/2026'
  },
  {
    id: 3,
    code: 'FREESHIP3KM',
    title: 'Miễn Phí Giao Hàng Bán Kính 3KM',
    desc: 'Ưu đãi đặc quyền giao đồ uống tận nơi miễn phí phí vận chuyển cho đơn từ 100.000đ.',
    discountText: 'FREESHIP',
    minOrder: 'Đơn từ 100K',
    badge: 'Giao Hàng',
    color: 'from-blue-500 to-cyan-500',
    icon: 'fa-motorcycle',
    expiry: 'HSD: 31/12/2026'
  },
  {
    id: 4,
    code: 'HERITAGEVIP',
    title: 'Giảm 15% Đặc Quyền Hội Viên VIP',
    desc: 'Dành riêng cho hội viên từ hạng Bạc trở lên. Tận hưởng hương vị cao cấp với mức giá ưu đãi nhất.',
    discountText: '-15%',
    minOrder: 'Mọi đơn hàng',
    badge: 'Hội Viên',
    color: 'from-purple-600 to-indigo-600',
    icon: 'fa-crown',
    expiry: 'Không thời hạn'
  },
  {
    id: 5,
    code: 'ACOUSTIC20',
    title: 'Giảm 20% Vào Đêm Live Acoustic',
    desc: 'Áp dụng khi đặt bàn hoặc thưởng thức đồ uống tại không gian Live Acoustic vào tối Thứ 7 & CN.',
    discountText: '-20%',
    minOrder: 'Đơn từ 150K',
    badge: 'Sự Kiện',
    color: 'from-emerald-600 to-teal-600',
    icon: 'fa-guitar',
    expiry: 'Hàng tuần'
  }
]

const HistoryView = ({ user, reviews, onOpenReview, showNotify }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('offers')
  const [copiedCode, setCopiedCode] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [dbReviews, setDbReviews] = useState({})

  useEffect(() => {
    if (!user) return

    const fetchHistoryAndReviews = async () => {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      if (!isConfigured) return

      setLoading(true)
      try {
        // 1. Fetch Orders from Supabase
        const { data: orderData, error: orderErr } = await supabase
          .from('donhang')
          .select(`
            DonHangID,
            MaDonHang,
            NgayTao,
            TongTien,
            TrangThai,
            loaidonhang:LoaiDonHangID ( TenLoaiDonHang ),
            chitietdonhang:chitietdonhang (
              ChiTietDonHangID,
              SoLuong,
              ThanhTien,
              sanphamsize:SanPhamSizeID (
                KichThuoc,
                sanpham:SanPhamID (
                  SanPhamID,
                  TenSanPham,
                  HinhAnh
                )
              )
            )
          `)
          .eq('KhachHangID', user.NguoiDungID)
          .order('NgayTao', { ascending: false })

        if (orderErr) throw orderErr

        if (orderData && orderData.length > 0) {
          const mappedOrders = orderData.map((order) => {
            const formattedTime = new Date(order.NgayTao).toLocaleDateString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
            
            // Map items
            const items = order.chitietdonhang?.map((detail) => {
              const sp = detail.sanphamsize?.sanpham
              return {
                SanPhamID: sp?.SanPhamID || 0,
                TenSanPham: sp?.TenSanPham || 'Sản phẩm',
                icon: sp?.HinhAnh || 'fa-mug-hot',
                size: detail.sanphamsize?.KichThuoc || 'S'
              }
            }) || []

            let orderType = 'Đặt Online'
            if (order.loaidonhang?.TenLoaiDonHang === 'TaiQuan') orderType = 'Tại quán'
            if (order.loaidonhang?.TenLoaiDonHang === 'MangDi') orderType = 'Mang đi'
            if (order.loaidonhang?.TenLoaiDonHang === 'DatOnline') orderType = 'Giao hàng'

            let orderStatus = 'Chờ xác nhận'
            if (order.TrangThai === 'DangPhaChe') orderStatus = 'Đang pha chế'
            if (order.TrangThai === 'DangGiao') orderStatus = 'Đang giao hàng'
            if (order.TrangThai === 'HoanThanh') orderStatus = 'Hoàn thành'
            if (order.TrangThai === 'DaHuy') orderStatus = 'Đã hủy'

            return {
              id: order.MaDonHang || `#DH${order.DonHangID}`,
              id_db: order.DonHangID,
              time: formattedTime,
              type: orderType,
              total: parseFloat(order.TongTien || 0),
              status: orderStatus,
              items: items
            }
          })
          setOrders(mappedOrders)
        }

        // 2. Fetch Reviews from Supabase
        const { data: revData, error: revErr } = await supabase
          .from('danhgia')
          .select('DonHangID, SanPhamID, SoSao, BinhLuan')
          .eq('KhachHangID', user.NguoiDungID)

        if (revErr) throw revErr
        if (revData) {
          const revMap = {}
          revData.forEach((r) => {
            // Find order code corresponding to DB order ID
            const matchingOrder = orderData.find(o => o.DonHangID === r.DonHangID)
            const orderCode = matchingOrder?.MaDonHang || `#DH${r.DonHangID}`
            revMap[`${orderCode}-${r.SanPhamID}`] = { rating: r.SoSao, comment: r.BinhLuan }
          })
          setDbReviews(revMap)
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoryAndReviews()

    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    const channel = supabase
      .channel(`customer_history_realtime_${user.NguoiDungID}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'donhang', filter: `KhachHangID=eq.${user.NguoiDungID}` },
        (payload) => {
          if (showNotify) showNotify(`🔔 Đơn hàng #${payload.new.DonHangID} của bạn vừa được cập nhật trạng thái!`)
          fetchHistoryAndReviews()
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donhang', filter: `KhachHangID=eq.${user.NguoiDungID}` },
        () => {
          setTimeout(() => fetchHistoryAndReviews(), 1500)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, reviews])

  // Merge Supabase reviews and memory reviews
  const activeReviews = { ...dbReviews, ...reviews }

  if (!user) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <h2 className="text-size-2 font-black uppercase text-gray-500">
          Vui lòng đăng nhập để xem lịch sử
        </h2>
      </div>
    )
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    if (showNotify) showNotify(`Đã sao chép mã voucher: ${code}`)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  return (
    <section className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <h2 className="text-size-2 font-black uppercase text-coffee-dark text-center mb-6 tracking-tighter">
        Ưu Đãi & Lịch Sử Hoạt Động
      </h2>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/80 p-1.5 rounded-full shadow-md border border-gray-200/60 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-2.5 rounded-full font-extrabold uppercase text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'offers'
                ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/20 scale-105'
                : 'text-gray-600 hover:text-coffee-green hover:bg-gray-100/50'
            }`}
          >
            <i className="fa-solid fa-gift text-coffee-yellow"></i>
            🎁 Săn Gói Ưu Đãi ({OFFERS.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-full font-extrabold uppercase text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/20 scale-105'
                : 'text-gray-600 hover:text-coffee-green hover:bg-gray-100/50'
            }`}
          >
            <i className="fa-solid fa-receipt text-coffee-yellow"></i>
            📜 Lịch Sử Đơn Hàng ({orders.length})
          </button>
        </div>
      </div>
      
      {activeTab === 'offers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {OFFERS.map((offer) => {
            const isCopied = copiedCode === offer.code
            return (
              <div
                key={offer.id}
                className="glass-effect p-6 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
              >
                {/* Top Badge */}
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${offer.color} text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`fa-solid ${offer.icon}`}></i>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest mb-1 border border-emerald-200">
                        {offer.badge}
                      </span>
                      <h3 className="text-size-1 font-black text-coffee-dark leading-snug">
                        {offer.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-coffee-yellow block leading-none">
                      {offer.discountText}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 mt-1 block">
                      {offer.minOrder}
                    </span>
                  </div>
                </div>

                <p className="text-size-1 text-gray-600 font-medium mb-6 line-clamp-2">
                  {offer.desc}
                </p>

                {/* Dashed separator */}
                <div className="border-t-2 border-dashed border-gray-200/80 my-3 relative">
                  <div className="w-6 h-6 rounded-full bg-coffee-bg absolute -left-9 -top-3"></div>
                  <div className="w-6 h-6 rounded-full bg-coffee-bg absolute -right-9 -top-3"></div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400">MÃ VOUCHER:</span>
                    <span className="text-size-1 font-black text-coffee-green tracking-wider font-mono">
                      {offer.code}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      <i className={`fa-solid ${isCopied ? 'fa-check' : 'fa-copy'}`}></i>
                      {isCopied ? 'Đã lưu' : 'Sao chép'}
                    </button>
                    <button
                      onClick={() => navigate('/menu')}
                      className="btn-primary px-4 py-2 text-xs font-black uppercase tracking-wider bg-coffee-green hover:bg-emerald-800 shadow-md active:scale-95"
                    >
                      Dùng Ngay
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-[10px] font-bold text-gray-400 italic">
                    {offer.expiry}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : loading ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải lịch sử mua hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <i className="fa-solid fa-receipt text-[4rem] text-gray-400 mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Bạn chưa mua đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => (
            <div key={idx} className="glass-effect p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-white">
              <div className="flex flex-wrap gap-4 justify-between items-center border-b-2 border-white/50 pb-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0 border border-gray-100">
                    <i className="fa-solid fa-receipt text-size-2"></i>
                  </div>
                  <div>
                    <p className="text-size-1 font-black text-coffee-dark">{order.id}</p>
                    <p className="text-size-1 font-medium text-gray-500">
                      {order.time} - {order.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-size-2 font-black text-coffee-green leading-none">
                    {order.total.toLocaleString()}đ
                  </p>
                  <div className="mt-2 flex flex-col items-end gap-2">
                    <p className={`text-size-1 font-bold px-4 py-1 rounded-full border ${
                      order.status === 'Hoàn thành'
                        ? 'text-green-600 bg-green-50 border-green-100'
                        : order.status === 'Đang pha chế'
                        ? 'text-blue-500 bg-blue-50 border-blue-100'
                        : order.status === 'Đang giao hàng'
                        ? 'text-purple-500 bg-purple-50 border-purple-100'
                        : order.status === 'Đã hủy'
                        ? 'text-red-500 bg-red-50 border-red-100'
                        : 'text-amber-500 bg-amber-50 border-amber-100'
                    }`}>
                      {order.status}
                    </p>
                    {order.type === 'Giao hàng' && order.status === 'Đang giao hàng' && (
                      <button 
                        onClick={async () => {
                          if (!window.confirm('Bạn xác nhận đã nhận được đơn hàng này?')) return;
                          try {
                            const { error } = await supabase
                              .from('donhang')
                              .update({ TrangThai: 'HoanThanh' })
                              .eq('DonHangID', order.id_db);
                            if (error) throw error;
                            
                            // Calculate and add points
                            const { getMembershipRank, calculateOrderPoints } = await import('../utils/membershipUtils');
                            const earnedPoints = calculateOrderPoints(order.total);
                            const newPoints = (user.TongDiem || 0) + earnedPoints;
                            const newRank = getMembershipRank(newPoints);
                            
                            await supabase
                              .from('nguoidung')
                              .update({ TongDiem: newPoints, HangThanhVienID: newRank.id })
                              .eq('NguoiDungID', user.NguoiDungID);
                              
                            if (showNotify) showNotify(`Cảm ơn bạn! Bạn được cộng +${earnedPoints} điểm.`);
                            if (onUpdateUser) {
                              onUpdateUser({
                                ...user,
                                TongDiem: newPoints,
                                HangThanhVienID: newRank.id,
                                TenHang: newRank.name,
                                GiamGia: newRank.discount
                              });
                            }
                          } catch (err) {
                            console.error('Lỗi khi xác nhận nhận hàng:', err.message);
                            if (showNotify) showNotify('Có lỗi xảy ra, vui lòng thử lại.');
                          }
                        }}
                        className="btn-primary px-4 py-1 text-size-0 bg-gradient-to-r from-blue-500 to-indigo-600 border-none shadow-sm hover:shadow-md"
                      >
                        Đã Nhận Hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-size-0 font-black text-gray-500 uppercase tracking-widest ml-2 mb-2">
                  Chi tiết các món
                </p>
                {order.items.map((item, i) => {
                  const reviewKey = `${order.id}-${item.SanPhamID}`
                  const hasReviewed = activeReviews[reviewKey]
                  const isCompleted = order.status === 'Hoàn thành'

                  return (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-coffee-green shadow-sm shrink-0">
                          <i className={`fa-solid ${item.icon} text-size-1`}></i>
                        </div>
                        <span className="text-size-1 font-black text-gray-700">
                          {item.TenSanPham} {item.size ? `(Size ${item.size})` : ''}
                        </span>
                      </div>
                      
                      {hasReviewed ? (
                        <div className="flex items-center gap-2 bg-yellow-50/80 px-4 py-2 rounded-full border border-yellow-100 shrink-0">
                          <i className="fa-solid fa-star text-coffee-yellow"></i>
                          <span className="text-size-1 font-black text-coffee-yellow">
                            {hasReviewed.rating} sao
                          </span>
                        </div>
                      ) : isCompleted ? (
                        <button
                          onClick={() => onOpenReview(order, item)}
                          className="btn-secondary px-4 py-1.5 text-size-0 shrink-0"
                        >
                          Đánh giá
                        </button>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default HistoryView
