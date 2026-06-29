import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const INITIAL_TABLES = [
  { id: 1, name: 'Bàn 1', seats: 2, type: 'round', top: '15%', left: '35%', status: 'Trong' },
  { id: 2, name: 'Bàn 2', seats: 2, type: 'round', top: '15%', left: '55%', status: 'DangDung' },
  { id: 3, name: 'Bàn 3', seats: 4, type: 'rect', top: '50%', left: '25%', status: 'Trong' },
  { id: 4, name: 'Bàn 4', seats: 4, type: 'rect', top: '50%', left: '50%', status: 'DaDat' },
  { id: 5, name: 'VIP 1', seats: 6, type: 'rect', top: '25%', left: '80%', status: 'Trong' },
  { id: 6, name: 'Bàn 5', seats: 4, type: 'round', top: '80%', left: '30%', status: 'Trong' },
  { id: 7, name: 'Bàn 6', seats: 4, type: 'rect', top: '80%', left: '60%', status: 'Trong' },
  { id: 8, name: 'Bàn 7', seats: 4, type: 'rect', top: '80%', left: '85%', status: 'Trong' }
]

const MOCK_BOOKINGS = [
  { id: 201, name: 'Nguyễn Văn Khách', phone: '0987654321', tableName: 'Bàn 4', tableId: 4, time: '28/06/2026 - 19:30', status: 'ChoXacNhan', note: 'Sinh nhật khách VIP' }
]

const TablesView = ({ showNotify }) => {
  const [tables, setTables] = useState(INITIAL_TABLES)
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)

  const fetchTablesAndBookings = async () => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    setLoadingBookings(true)
    try {
      // 1. Fetch Tables
      const { data: tableData, error: tableErr } = await supabase
        .from('ban')
        .select('*')
        .order('BanID')

      if (tableErr) throw tableErr
      if (tableData) {
        const mapped = tableData.map((t, idx) => {
          const layoutPreset = INITIAL_TABLES[idx] || {
            top: `${20 + Math.floor(idx / 3) * 30}%`,
            left: `${20 + (idx % 3) * 30}%`,
            type: t.SucChua > 4 ? 'rect' : 'round'
          }
          return {
            id: t.BanID,
            name: t.TenBan,
            seats: t.SucChua,
            type: layoutPreset.type,
            top: layoutPreset.top,
            left: layoutPreset.left,
            status: t.TrangThai // 'Trong', 'DangDung', 'DaDat', 'BaoTri'
          }
        })
        setTables(mapped)
      }

      // 2. Fetch Bookings
      const { data: bookData, error: bookErr } = await supabase
        .from('datban')
        .select(`
          DatBanID,
          ThoiGianDat,
          SoNguoi,
          GhiChu,
          TrangThai,
          ban:BanID ( TenBan, BanID ),
          nguoidung:KhachHangID ( HoTen, SoDienThoai )
        `)
        .order('NgayTao', { ascending: false })

      if (bookErr) throw bookErr
      if (bookData) {
        const mappedBooks = bookData.map(b => {
          const formattedTime = new Date(b.ThoiGianDat).toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })

          return {
            id: b.DatBanID,
            name: b.nguoidung?.HoTen || 'Ẩn danh',
            phone: b.nguoidung?.SoDienThoai || 'Không có',
            tableName: b.ban?.TenBan || 'Chưa xếp bàn',
            tableId: b.ban?.BanID || null,
            time: formattedTime,
            status: b.TrangThai, // 'ChoXacNhan', 'DaXacNhan', 'DaHuy', 'HoanThanh'
            note: b.GhiChu || 'Không'
          }
        })
        setBookings(mappedBooks)
      }
    } catch (err) {
      console.error('Lỗi khi tải sơ đồ bàn & đặt bàn:', err.message)
    } finally {
      setLoadingBookings(false)
    }
  }

  useEffect(() => {
    fetchTablesAndBookings()
  }, [])

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('ban')
          .update({ TrangThai: newStatus })
          .eq('BanID', tableId)

        if (error) throw error
      }
      
      setTables(prev =>
        prev.map(t => (t.id === tableId ? { ...t, status: newStatus } : t))
      )
      setSelectedTable(null)
      showNotify(`Cập nhật trạng thái bàn thành công!`)
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái bàn:', err.message)
    }
  }

  const handleBookingAction = async (booking, action) => {
    // action: 'Approve' -> 'DaXacNhan', 'Reject' -> 'DaHuy', 'Complete' -> 'HoanThanh'
    const targetStatus = action === 'Approve' ? 'DaXacNhan' : action === 'Reject' ? 'DaHuy' : 'HoanThanh'
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      if (isConfigured) {
        // 1. Update Booking state
        const { error: bookErr } = await supabase
          .from('datban')
          .update({ TrangThai: targetStatus })
          .eq('DatBanID', booking.id)

        if (bookErr) throw bookErr

        // 2. If approved, lock table to 'DaDat'. If completed/rejected, release to 'Trong'
        if (booking.tableId) {
          const tableStatus = action === 'Approve' ? 'DaDat' : 'Trong'
          const { error: tableErr } = await supabase
            .from('ban')
            .update({ TrangThai: tableStatus })
            .eq('BanID', booking.tableId)

          if (tableErr) throw tableErr
        }
      }

      setBookings(prev =>
        prev.map(b => (b.id === booking.id ? { ...b, status: targetStatus } : b))
      )

      if (booking.tableId) {
        const tableStatus = action === 'Approve' ? 'DaDat' : 'Trong'
        setTables(prev =>
          prev.map(t => (t.id === booking.tableId ? { ...t, status: tableStatus } : t))
        )
      }

      showNotify(action === 'Approve' ? `Đã xác nhận đặt bàn!` : `Đã hủy đặt bàn!`)
    } catch (err) {
      console.error('Lỗi xử lý đặt bàn:', err.message)
    }
  }

  const renderChairs = (seats, type) => {
    let chairs = []
    for (let i = 0; i < seats; i++) {
      let posClass = ''
      if (type === 'round') {
        const angle = (i / seats) * 360
        posClass = `absolute w-2 h-2 bg-gray-300 rounded-full border border-gray-400`
        chairs.push(
          <div
            key={i}
            className={posClass}
            style={{
              transform: `rotate(${angle}deg) translateY(-140%)`,
              top: '50%',
              left: '50%',
              marginTop: '-0.25rem',
              marginLeft: '-0.25rem'
            }}
          ></div>
        )
      } else {
        const isTop = i < seats / 2
        const lr = seats > 4 ? (i % (seats / 2) * 35) + 15 : (i % 2 * 50) + 25
        posClass = `absolute w-3 h-2 bg-gray-300 rounded-full border border-gray-400 ${
          isTop ? '-top-1.5' : '-bottom-1.5'
        }`
        chairs.push(
          <div
            key={i}
            className={posClass}
            style={{ left: `${lr}%`, transform: 'translateX(-50%)' }}
          ></div>
        )
      }
    }
    return chairs
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
          Sơ Đồ & Đặt Bàn
        </h2>
        <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
          Quản lý không gian quán và phê duyệt đặt bàn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map Layout */}
        <div className="lg:col-span-2 glass-effect p-6 rounded-[2rem] border border-white shadow-md relative">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark mb-4 pl-2">
            Mặt Bằng Cửa Hàng
          </h3>
          
          <div className="relative w-full aspect-[16/9] bg-white/60 rounded-3xl border-2 border-dashed border-gray-300 overflow-hidden shadow-inner">
            {/* Bar counter */}
            <div className="absolute top-0 left-0 w-[20%] h-[30%] bg-coffee-dark rounded-br-2xl flex items-center justify-center text-white text-size-0 font-bold uppercase shadow-md border-r-2 border-b-2 border-coffee-dark/80">
              Quầy Bar
            </div>

            {tables.map(t => {
              const baseClass = t.type === 'round' ? 'rounded-full' : 'rounded-lg'
              const sizeClass =
                t.type === 'round'
                  ? 'w-10 h-10 md:w-14 md:h-14'
                  : t.seats > 4
                  ? 'w-16 h-10 md:w-20 md:h-14'
                  : 'w-12 h-10 md:w-14 md:h-14'

              let stateColor = 'bg-white border-gray-300 text-gray-700'
              if (t.status === 'DangDung') stateColor = 'bg-red-500 border-red-500 text-white'
              if (t.status === 'DaDat') stateColor = 'bg-coffee-yellow border-coffee-yellow text-coffee-dark'
              if (t.status === 'BaoTri') stateColor = 'bg-gray-400 border-gray-400 text-white'

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTable(t)}
                  className={`absolute flex items-center justify-center border-2 text-[0.7rem] font-black cursor-pointer shadow-sm hover:scale-105 transition-all ${baseClass} ${sizeClass} ${stateColor}`}
                  style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}
                >
                  <span>{t.name}</span>
                  {renderChairs(t.seats, t.type)}
                </div>
              )
            })}
          </div>

          {/* Quick status edit overlay */}
          {selectedTable && (
            <div className="mt-4 p-4 bg-white/90 rounded-2xl border border-gray-100 flex items-center justify-between flex-wrap gap-3 animate-fade-in shadow-inner">
              <span className="text-size-1 font-black text-coffee-dark">
                Thiết lập {selectedTable.name}:
              </span>
              <div className="flex gap-2">
                {['Trong', 'DangDung', 'DaDat', 'BaoTri'].map(st => {
                  let btnLabel = 'Trống'
                  if (st === 'DangDung') btnLabel = 'Đang dùng'
                  if (st === 'DaDat') btnLabel = 'Đã đặt'
                  if (st === 'BaoTri') btnLabel = 'Bảo trì'

                  return (
                    <button
                      key={st}
                      onClick={() => handleUpdateTableStatus(selectedTable.id, st)}
                      className={`px-3 py-1.5 rounded-full text-size-0 font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
                        selectedTable.status === st
                          ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/15'
                          : 'bg-white hover:bg-coffee-green/5 border border-coffee-grid/45 text-gray-600 hover:text-coffee-green shadow-sm'
                      }`}
                    >
                      {btnLabel}
                    </button>
                  )
                })}
                <button
                  onClick={() => setSelectedTable(null)}
                  className="btn-secondary px-3 py-1.5 text-size-0"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bookings Queue */}
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md flex flex-col h-full">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark mb-4">
            Đơn Đặt Chỗ
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[450px]">
            {loadingBookings ? (
              <p className="text-center py-6 text-size-1 font-bold text-gray-400">Đang tải danh sách đặt bàn...</p>
            ) : bookings.length === 0 ? (
              <p className="text-center py-6 text-size-1 font-bold text-gray-400">Không có đơn đặt bàn nào.</p>
            ) : (
              bookings.map((book, idx) => (
                <div key={idx} className="bg-white/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-size-0 font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-size-1 font-black text-coffee-dark">{book.name}</span>
                    <span className={`text-[0.65rem] font-black uppercase px-2 py-0.5 rounded-full border ${
                      book.status === 'DaXacNhan'
                        ? 'text-green-600 bg-green-50 border-green-100'
                        : book.status === 'DaHuy'
                        ? 'text-red-500 bg-red-50 border-red-100'
                        : 'text-amber-500 bg-amber-50 border-amber-100'
                    }`}>
                      {book.status === 'ChoXacNhan' ? 'Chờ duyệt' : book.status === 'DaXacNhan' ? 'Đã duyệt' : 'Đã hủy'}
                    </span>
                  </div>
                  <p className="text-gray-600">SĐT: {book.phone}</p>
                  <p className="text-gray-600">Bàn: <span className="font-bold text-coffee-green">{book.tableName}</span></p>
                  <p className="text-gray-600">Thời gian: {book.time}</p>
                  <p className="text-gray-400">Ghi chú: {book.note}</p>
                  
                  {book.status === 'ChoXacNhan' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleBookingAction(book, 'Approve')}
                        className="flex-1 btn-primary py-1.5 text-size-0"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleBookingAction(book, 'Reject')}
                        className="flex-1 btn-danger py-1.5 text-size-0"
                      >
                        Từ Chối
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TablesView
