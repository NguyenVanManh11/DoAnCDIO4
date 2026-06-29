import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MOCK_ORDERS = [
  {
    id: '#DH1002',
    id_db: 1001,
    time: 'Hôm qua',
    type: 'Tại quán',
    total: 85000,
    status: 'Hoàn thành',
    items: [
      { SanPhamID: 1, TenSanPham: 'CÀ PHÊ ĐEN TRUYỀN THỐNG', icon: 'fa-mug-hot' },
      { SanPhamID: 4, TenSanPham: 'BÁNH CROISSANT', icon: 'fa-cookie' }
    ]
  },
  {
    id: '#DH0981',
    id_db: 1002,
    time: '20/05/2026',
    type: 'Giao hàng',
    total: 120000,
    status: 'Hoàn thành',
    items: [
      { SanPhamID: 2, TenSanPham: 'BẠC XỈU ĐÁ', icon: 'fa-mug-saucer' },
      { SanPhamID: 7, TenSanPham: 'TIRAMISU', icon: 'fa-cake-candles' }
    ]
  }
]

const HistoryView = ({ user, reviews, onOpenReview }) => {
  const [orders, setOrders] = useState(MOCK_ORDERS)
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

  return (
    <section className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <h2 className="text-size-2 font-black uppercase text-coffee-dark text-center mb-8 tracking-tighter">
        Lịch sử Đơn Hàng & Đánh Giá
      </h2>
      
      {loading ? (
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
                  <p className="text-size-1 font-bold text-green-600 bg-green-50 px-4 py-1 rounded-full inline-block mt-2 border border-green-100">
                    {order.status}
                  </p>
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
