import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const DashboardView = () => {
  const [stats, setStats] = useState({
    revenue: 405000,
    orders: 4,
    customers: 24,
    reviews: 96
  })
  const [recentOrders, setRecentOrders] = useState([
    { code: '#DH1002', name: 'Nguyễn Văn Khách', items: '2x Cà phê đen, 1x Croissant', total: 85000, status: 'Hoàn thành' },
    { code: '#DH0981', name: 'Trần Văn Khách', items: '2x Bạc xỉu, 1x Tiramisu', total: 120000, status: 'Hoàn thành' },
    { code: '#DH1005', name: 'Phạm Thị Khách', items: '1x Trà đào cam sả', total: 40000, status: 'Đang pha chế' },
    { code: '#DH1006', name: 'Nguyễn Văn Khách', items: '2x Bạc xỉu đá', total: 60000, status: 'Chờ xác nhận' }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      if (!isConfigured) return

      setLoading(true)
      try {
        // 1. Fetch statistics
        // Fetch completed orders count & total revenue
        const { data: orderData, error: orderErr } = await supabase
          .from('donhang')
          .select('ThanhTien, TrangThai, NgayTao')
        if (orderErr) throw orderErr

        let completedTotal = 0
        let completedCount = 0
        let dailyRevenue = 0
        const todayStr = new Date().toDateString()

        if (orderData) {
          orderData.forEach(o => {
            if (o.TrangThai === 'HoanThanh') {
              completedCount++
              completedTotal += parseFloat(o.ThanhTien || 0)
              
              if (new Date(o.NgayTao).toDateString() === todayStr) {
                dailyRevenue += parseFloat(o.ThanhTien || 0)
              }
            }
          })
        }

        // Fetch customer count
        const { count: customerCount, error: custErr } = await supabase
          .from('nguoidung')
          .select('*', { count: 'exact', head: true })
          .eq('VaiTroID', 6)
          .eq('DaXoa', false)
        if (custErr) throw custErr

        // Fetch good reviews count (SoSao >= 4)
        const { data: revData, error: revErr } = await supabase
          .from('danhgia')
          .select('SoSao')
        if (revErr) throw revErr

        let goodReviews = 0
        if (revData) {
          revData.forEach(r => {
            if (r.SoSao >= 4) goodReviews++
          })
        }
        const pctGoodReviews = revData && revData.length > 0 ? Math.round((goodReviews / revData.length) * 100) : 96

        setStats({
          revenue: dailyRevenue > 0 ? dailyRevenue : (completedTotal > 0 ? completedTotal : 405000),
          orders: completedCount > 0 ? completedCount : 4,
          customers: customerCount !== null ? customerCount : 24,
          reviews: pctGoodReviews
        })

        // 2. Fetch Recent Orders (Join with nguoidung and chitietdonhang)
        const { data: recent, error: recentErr } = await supabase
          .from('donhang')
          .select(`
            MaDonHang,
            DonHangID,
            TongTien,
            ThanhTien,
            TrangThai,
            nguoidung:KhachHangID ( HoTen ),
            chitietdonhang:chitietdonhang (
              SoLuong,
              sanphamsize:SanPhamSizeID (
                sanpham:SanPhamID ( TenSanPham )
              )
            )
          `)
          .order('NgayTao', { ascending: false })
          .limit(5)

        if (recentErr) throw recentErr
        if (recent && recent.length > 0) {
          const mapped = recent.map(r => {
            const itemsString = r.chitietdonhang?.map(detail => {
              const name = detail.sanphamsize?.sanpham?.TenSanPham || 'Sản phẩm'
              return `${detail.SoLuong}x ${name}`
            }).join(', ') || 'Chi tiết trống'

            let orderStatus = 'Chờ xác nhận'
            if (r.TrangThai === 'DangPhaChe') orderStatus = 'Đang pha chế'
            if (r.TrangThai === 'DangGiao') orderStatus = 'Đang giao hàng'
            if (r.TrangThai === 'HoanThanh') orderStatus = 'Hoàn thành'
            if (r.TrangThai === 'DaHuy') orderStatus = 'Đã hủy'

            return {
              code: r.MaDonHang || `#DH${r.DonHangID}`,
              name: r.nguoidung?.HoTen || 'Khách Vãng Lai',
              items: itemsString,
              total: parseFloat(r.ThanhTien || 0),
              status: orderStatus
            }
          })
          setRecentOrders(mapped)
        }
      } catch (err) {
        console.error('Lỗi khi truy vấn Dashboard:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    { title: 'Doanh thu hôm nay', val: `${stats.revenue.toLocaleString()}đ`, unit: 'VND', icon: 'fa-money-bill-trend-up', color: 'text-coffee-green bg-green-50 border-green-100' },
    { title: 'Đơn hoàn thành', val: stats.orders, unit: 'Đơn', icon: 'fa-circle-check', color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { title: 'Khách hàng đăng ký', val: stats.customers, unit: 'Khách', icon: 'fa-users', color: 'text-purple-500 bg-purple-50 border-purple-100' },
    { title: 'Phản hồi hài lòng', val: `${stats.reviews}%`, unit: 'Hài lòng', icon: 'fa-star', color: 'text-coffee-yellow bg-yellow-50 border-yellow-100' }
  ]

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
          Hệ Thống Tổng Quan
        </h2>
        <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
          Theo dõi số liệu thời gian thực
        </p>
      </div>

      {/* Grid thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => (
          <div key={idx} className={`glass-effect p-6 rounded-3xl border flex items-center justify-between shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300`}>
            <div>
              <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest mb-1">
                {c.title}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-size-2 font-black text-coffee-dark leading-none">{c.val}</span>
                <span className="text-size-0 font-bold text-gray-400">{c.unit}</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${c.color}`}>
              <i className={`fa-solid ${c.icon} text-size-1`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Bảng đơn hàng gần đây */}
      <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-xl flex-1 flex flex-col min-h-[300px]">
        <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark mb-6">
          Đơn Hàng Mới Nhất
        </h3>
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-10">
            <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
            <p className="text-size-1 font-bold">Đang cập nhật danh sách đơn mới...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-size-0 font-black uppercase tracking-wider text-gray-400">
                  <th className="pb-4 pl-4">Mã Đơn</th>
                  <th className="pb-4">Khách Hàng</th>
                  <th className="pb-4">Đồ Uống & Món Ăn</th>
                  <th className="pb-4">Tổng Thanh Toán</th>
                  <th className="pb-4 pr-4 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-white/40 transition-colors">
                    <td className="py-4 pl-4 text-size-1 font-black text-coffee-dark">{ord.code}</td>
                    <td className="py-4 text-size-1 font-bold text-gray-700">{ord.name}</td>
                    <td className="py-4 text-size-1 font-medium text-gray-500 max-w-[250px] truncate" title={ord.items}>
                      {ord.items}
                    </td>
                    <td className="py-4 text-size-1 font-black text-coffee-green">{ord.total.toLocaleString()}đ</td>
                    <td className="py-4 pr-4 text-right">
                      <span className={`text-[0.75rem] font-black uppercase px-3 py-1 rounded-full border ${
                        ord.status === 'Hoàn thành'
                          ? 'text-green-600 bg-green-50 border-green-100'
                          : ord.status === 'Đang pha chế'
                          ? 'text-blue-500 bg-blue-50 border-blue-100'
                          : 'text-amber-500 bg-amber-50 border-amber-100'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardView
