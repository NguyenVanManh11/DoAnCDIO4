import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { getMembershipRank, calculateOrderPoints } from '../utils/membershipUtils'

const FILTER_TABS = [
  { id: 'Tất cả', label: 'Tất cả' },
  { id: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { id: 'Đang pha chế', label: 'Pha chế' },
  { id: 'Đang giao hàng', label: 'Đang giao' },
  { id: 'Hoàn thành', label: 'Hoàn thành' },
  { id: 'Đã hủy', label: 'Đã hủy' }
]

const OrdersView = ({ showNotify }) => {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('Tất cả')
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('donhang')
        .select(`
          DonHangID,
          MaDonHang,
          TongTien,
          ThanhTien,
          TrangThai,
          GhiChu,
          nguoidung:KhachHangID ( NguoiDungID, HoTen, TongDiem ),
          chitietdonhang:chitietdonhang (
            SoLuong,
            sanphamsize:SanPhamSizeID (
              sanpham:SanPhamID ( TenSanPham )
            )
          )
        `)
        .order('NgayTao', { ascending: false })

      if (error) throw error
      if (data) {
        const mapped = data.map(o => {
          const itemsString = o.chitietdonhang?.map(detail => {
            const name = detail.sanphamsize?.sanpham?.TenSanPham || 'Sản phẩm'
            return `${detail.SoLuong}x ${name}`
          }).join(', ') || 'Chi tiết trống'

          let orderStatus = 'Chờ xác nhận'
          if (o.TrangThai === 'DangPhaChe') orderStatus = 'Đang pha chế'
          if (o.TrangThai === 'DangGiao') orderStatus = 'Đang giao hàng'
          if (o.TrangThai === 'HoanThanh') orderStatus = 'Hoàn thành'
          if (o.TrangThai === 'DaHuy') orderStatus = 'Đã hủy'

          return {
            id: o.MaDonHang || `#DH${o.DonHangID}`,
            id_db: o.DonHangID,
            customerId: o.nguoidung?.NguoiDungID || null,
            customerPoints: o.nguoidung?.TongDiem || 0,
            name: o.nguoidung?.HoTen || 'Khách Vãng Lai',
            items: itemsString,
            total: parseFloat(o.ThanhTien || 0),
            status: orderStatus,
            note: o.GhiChu || 'Không có ghi chú'
          }
        })
        setOrders(mapped)
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    const channel = supabase
      .channel('admin_donhang_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donhang' },
        () => {
          // Đợi 1.5s để client lưu xong các dòng chitietdonhang
          setTimeout(() => fetchOrders(), 1500)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'donhang' },
        () => {
          fetchOrders()
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'donhang' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateOrderStatus = async (orderIdDb, currentCode, targetStatusStr) => {
    // Map status string back to DB enum
    let dbStatusEnum = 'ChoXacNhan'
    if (targetStatusStr === 'Đang pha chế') dbStatusEnum = 'DangPhaChe'
    if (targetStatusStr === 'Đang giao hàng') dbStatusEnum = 'DangGiao'
    if (targetStatusStr === 'Hoàn thành') dbStatusEnum = 'HoanThanh'
    if (targetStatusStr === 'Đã hủy') dbStatusEnum = 'DaHuy'

    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    try {
      if (isConfigured && orderIdDb) {
        const { error } = await supabase
          .from('donhang')
          .update({ TrangThai: dbStatusEnum })
          .eq('DonHangID', orderIdDb)

        if (error) throw error

        // Tích điểm thành viên khi hoàn thành đơn
        if (targetStatusStr === 'Hoàn thành') {
          const targetOrder = orders.find(o => o.id_db === orderIdDb)
          if (targetOrder && targetOrder.customerId) {
            const earnedPoints = calculateOrderPoints(targetOrder.total)
            const newPoints = (targetOrder.customerPoints || 0) + earnedPoints
            const newRank = getMembershipRank(newPoints)
            
            await supabase
              .from('nguoidung')
              .update({ TongDiem: newPoints, HangThanhVienID: newRank.id })
              .eq('NguoiDungID', targetOrder.customerId)
              
            showNotify(`Đơn ${currentCode} hoàn thành! Khách +${earnedPoints} điểm (Tổng ${newPoints}đ - Hạng ${newRank.name})`)
          } else {
            showNotify(`Đơn ${currentCode} đã cập nhật sang "${targetStatusStr}"`)
          }
        } else {
          showNotify(`Đơn ${currentCode} đã cập nhật sang "${targetStatusStr}"`)
        }
      } else {
        showNotify(`Đơn ${currentCode} đã cập nhật sang "${targetStatusStr}"`)
      }

      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id_db === orderIdDb ? { ...o, status: targetStatusStr } : o))
      )
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn:', err.message)
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!')
    }
  }

  const filteredOrders = orders.filter(o => filter === 'Tất cả' || o.status === filter)

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Quản Lý Đơn Hàng
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Xử lý quy trình đơn hàng và giao nhận
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-secondary px-4 py-2 text-size-0"
        >
          <i className="fa-solid fa-arrows-rotate"></i> Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white/60 p-1.5 rounded-full shadow-inner border border-white/80 overflow-x-auto no-scrollbar w-max max-w-full shrink-0">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2 text-size-1 font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 uppercase whitespace-nowrap ${
              filter === tab.id
                ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/15'
                : 'text-gray-600 hover:bg-white/80 hover:text-coffee-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải danh sách đơn...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white opacity-60">
          <i className="fa-solid fa-folder-open text-size-2 mb-4 text-gray-400"></i>
          <p className="text-size-1 font-bold text-gray-500">Không có đơn nào thuộc bộ lọc này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord, idx) => (
            <div key={idx} className="glass-effect p-6 rounded-[2rem] border border-white shadow-md hover:shadow-lg transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-size-1 font-black text-coffee-dark">{ord.code}</span>
                  <span className={`text-[0.7rem] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    ord.status === 'Hoàn thành'
                      ? 'text-green-600 bg-green-50 border-green-100'
                      : ord.status === 'Đang pha chế'
                      ? 'text-blue-500 bg-blue-50 border-blue-100'
                      : ord.status === 'Đang giao hàng'
                      ? 'text-purple-500 bg-purple-50 border-purple-100'
                      : ord.status === 'Đã hủy'
                      ? 'text-red-500 bg-red-50 border-red-100'
                      : 'text-amber-500 bg-amber-50 border-amber-100'
                  }`}>
                    {ord.status}
                  </span>
                  <span className="text-size-1 font-black text-coffee-green ml-auto md:ml-0">
                    {ord.total.toLocaleString()}đ
                  </span>
                </div>
                <p className="text-size-1 font-bold text-gray-700 mb-1">Khách: {ord.name}</p>
                <p className="text-size-1 font-medium text-gray-500 mb-1">Món: {ord.items}</p>
                <p className="text-size-0 font-bold text-gray-400">Ghi chú: {ord.note}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                {ord.status === 'Chờ xác nhận' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(ord.id_db, ord.code, 'Đang pha chế')}
                      className="btn-primary px-4 py-1.5 text-size-0"
                    >
                      Duyệt Pha Chế
                    </button>
                    <button
                      onClick={() => updateOrderStatus(ord.id_db, ord.code, 'Đã hủy')}
                      className="btn-danger px-4 py-1.5 text-size-0"
                    >
                      Hủy Đơn
                    </button>
                  </>
                )}
                
                {ord.status === 'Đang pha chế' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(ord.id_db, ord.code, 'Đang giao hàng')}
                      className="btn-primary bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/20 px-4 py-1.5 text-size-0 border-none"
                    >
                      Giao Hàng
                    </button>
                    <button
                      onClick={() => updateOrderStatus(ord.id_db, ord.code, 'Hoàn thành')}
                      className="btn-primary px-4 py-1.5 text-size-0"
                    >
                      Hoàn Thành
                    </button>
                  </>
                )}

                {ord.status === 'Đang giao hàng' && (
                  <button
                    onClick={() => updateOrderStatus(ord.id_db, ord.code, 'Hoàn thành')}
                    className="btn-primary px-4 py-1.5 text-size-0"
                  >
                    Đã Giao Xong
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersView
