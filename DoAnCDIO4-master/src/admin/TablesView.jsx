import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import CustomDropdown from '../components/CustomDropdown'

const TABLE_POSITIONS = [
  { left: '38%', top: '22%' }, // Bàn 1 (Live Acoustic)
  { left: '55%', top: '22%' }, // Bàn 2 (Live Acoustic)
  { left: '82%', top: '25%' }, // Bàn 3 (VIP)
  { left: '18%', top: '75%' }, // Bàn 4 (Góc Đọc Sách)
  { left: '48%', top: '55%' }, // Bàn 5 (Chính giữa)
  { left: '75%', top: '55%' }, // Bàn 6 (Chính giữa phải)
  { left: '45%', top: '82%' }, // Bàn 7 (Sân vườn)
  { left: '68%', top: '82%' }, // Bàn 8 (Sân vườn)
  { left: '88%', top: '82%' }, // Bàn 9 (Sân vườn)
]

const TablesView = ({ showNotify }) => {
  const [tables, setTables] = useState([])
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formName, setFormName] = useState('')
  const [formSeats, setFormSeats] = useState(4)
  const [formStatus, setFormStatus] = useState('Trong')

  const openAddModal = () => {
    setEditingTable(null)
    setFormName(`Bàn ${tables.length + 1}`)
    setFormSeats(4)
    setFormStatus('Trong')
    setShowModal(true)
  }

  const openEditModal = (t) => {
    setEditingTable(t)
    setFormName(t.name)
    setFormSeats(t.seats)
    setFormStatus(t.status)
    setShowModal(true)
  }

  const handleSaveTable = async (e) => {
    e.preventDefault()
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

    if (editingTable) {
      if (isConfigured) {
        try {
          await supabase.from('ban').update({
            TenBan: formName,
            SucChua: Number(formSeats),
            TrangThai: formStatus
          }).eq('BanID', editingTable.id)
        } catch (err) {
          console.error('Lỗi khi sửa bàn DB:', err.message)
        }
      }
      setTables(prev => prev.map(t => t.id === editingTable.id ? {
        ...t,
        name: formName,
        seats: Number(formSeats),
        type: Number(formSeats) > 4 ? 'rect' : 'round',
        status: formStatus
      } : t))
      setShowModal(false)
      showNotify(`Đã cập nhật bàn: ${formName}`)
    } else {
      let newTable = {
        id: Date.now(),
        name: formName,
        seats: Number(formSeats),
        type: Number(formSeats) > 4 ? 'rect' : 'round',
        top: '50%',
        left: '50%',
        status: formStatus
      }

      if (isConfigured) {
        try {
          const { data, error } = await supabase
            .from('ban')
            .insert({
              TenBan: formName,
              SucChua: Number(formSeats),
              TrangThai: formStatus
            })
            .select()
            .single()

          if (!error && data) {
            newTable.id = data.BanID
          }
        } catch (err) {
          console.error('Lỗi khi thêm bàn DB:', err.message)
        }
      }

      setTables(prev => [...prev, newTable])
      setShowModal(false)
      showNotify(`Đã thêm bàn: ${formName}`)
    }
  }

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
          const pos = TABLE_POSITIONS[idx % TABLE_POSITIONS.length] || { left: '50%', top: '50%' }
          return {
            id: t.BanID,
            name: t.TenBan,
            seats: t.SucChua,
            type: t.SucChua > 4 ? 'rect' : 'round',
            top: t.ToaDoY || pos.top,
            left: t.ToaDoX || pos.left,
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

    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    const channelBan = supabase
      .channel('admin_ban_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ban' },
        () => {
          fetchTablesAndBookings()
        }
      )
      .subscribe()

    const channelDatBan = supabase
      .channel('admin_datban_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'datban' },
        () => {
          fetchTablesAndBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelBan)
      supabase.removeChannel(channelDatBan)
    }
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
        posClass = `absolute w-3 h-3 bg-gray-300 rounded-full border border-gray-400`
        chairs.push(
          <div
            key={i}
            className={posClass}
            style={{
              transform: `rotate(${angle}deg) translateY(-140%)`,
              top: '50%',
              left: '50%',
              marginTop: '-0.375rem',
              marginLeft: '-0.375rem'
            }}
          ></div>
        )
      } else {
        const isTop = i < seats / 2
        const lr = seats > 4 ? (i % (seats / 2) * 35) + 15 : (i % 2 * 50) + 25
        posClass = `absolute w-4 h-3 bg-gray-300 rounded-full border border-gray-400 ${
          isTop ? '-top-2' : '-bottom-2'
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark dark:text-emerald-400 tracking-tighter mb-1">
            Sơ Đồ & Đặt Bàn
          </h2>
          <p className="text-size-0 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Quản lý không gian quán và phê duyệt đặt bàn
          </p>
        </div>
        <button className="btn-primary py-2.5 px-5 text-size-0 whitespace-nowrap" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i> Thêm Bàn
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map Layout */}
        <div className="lg:col-span-2 glass-effect p-6 rounded-[2rem] border border-white dark:border-slate-800 shadow-md relative">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark dark:text-gray-100 mb-4 pl-2">
            Mặt Bằng Cửa Hàng
          </h3>
          
          <div 
            className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-white/50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden shadow-inner"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const tableId = e.dataTransfer.getData('tableId')
              if (!tableId) return
              
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              
              const leftPercent = Math.max(5, Math.min(95, (x / rect.width) * 100))
              const topPercent = Math.max(5, Math.min(95, (y / rect.height) * 100))
              
              const newLeft = `${leftPercent.toFixed(2)}%`
              const newTop = `${topPercent.toFixed(2)}%`

              setTables(prev => prev.map(t => t.id.toString() === tableId ? { ...t, left: newLeft, top: newTop } : t))
              
              const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
              if (isConfigured) {
                try {
                  await supabase.from('ban').update({
                    ToaDoX: newLeft,
                    ToaDoY: newTop
                  }).eq('BanID', tableId)
                } catch (err) {
                  console.error('Lỗi lưu toạ độ:', err.message)
                }
              }
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.5
              }}
            ></div>
            
            <div className="absolute top-0 left-0 w-[25%] h-[35%] bg-coffee-dark rounded-br-[2rem] flex flex-col items-center justify-center text-coffee-cup shadow-lg z-10 border-r-4 border-b-4 border-coffee-dark/80">
              <i className="fa-solid fa-mug-hot text-size-2 mb-1"></i>
              <span className="text-size-1 font-black uppercase text-white">Quầy Bar</span>
            </div>

            {/* Sân khấu Live Acoustic */}
            <div className="absolute top-0 left-[27%] w-[36%] h-[32%] bg-rose-100/60 rounded-b-[2rem] border-b-2 border-l-2 border-r-2 border-dashed border-rose-500 flex flex-col items-center justify-start pt-2 sm:pt-3 z-0">
              <span className="text-[0.65rem] sm:text-size-0 font-black text-rose-600 uppercase opacity-90 flex items-center gap-1.5">
                <i className="fa-solid fa-guitar"></i> Live Acoustic
              </span>
            </div>

            {/* Khu VIP */}
            <div className="absolute top-0 right-0 w-[35%] h-[45%] bg-yellow-100/50 rounded-bl-[2rem] border-l-2 border-b-2 border-dashed border-coffee-yellow flex items-start justify-end p-3 sm:p-4 z-0">
              <span className="text-[0.65rem] sm:text-size-0 font-black text-coffee-yellow uppercase opacity-90 flex items-center gap-1.5">
                <i className="fa-solid fa-crown"></i> VIP
              </span>
            </div>

            {/* Góc Đọc Sách */}
            <div className="absolute bottom-0 left-0 w-[32%] h-[45%] bg-amber-100/60 rounded-tr-[2rem] border-t-2 border-r-2 border-dashed border-amber-600 flex items-end justify-start p-3 sm:p-4 z-0">
              <span className="text-[0.65rem] sm:text-size-0 font-black text-amber-700 uppercase opacity-90 flex items-center gap-1.5">
                <i className="fa-solid fa-book-open"></i> Góc Đọc Sách
              </span>
            </div>

            {/* Sân Vườn */}
            <div className="absolute bottom-0 right-0 left-[35%] h-[38%] bg-green-100/50 rounded-tl-[2rem] border-t-2 border-l-2 border-dashed border-coffee-green flex items-end justify-end p-3 sm:p-4 z-0">
              <span className="text-[0.65rem] sm:text-size-0 font-black text-coffee-green uppercase opacity-90 flex items-center gap-1.5">
                <i className="fa-solid fa-tree"></i> Sân Vườn
              </span>
            </div>

            {tables.map((t) => {
              const isSelected = selectedTable?.id === t.id
              const baseClass = t.type === 'round' ? 'rounded-full' : 'rounded-xl'
              const sizeClass =
                t.type === 'round'
                  ? 'w-10 h-10 md:w-14 md:h-14'
                  : t.seats > 4
                  ? 'w-16 h-10 md:w-24 md:h-14'
                  : 'w-12 h-10 md:w-16 md:h-14'

              let stateColor = 'bg-white border-gray-300 text-gray-700 dark:bg-slate-700 dark:border-slate-500 dark:text-gray-200'
              if (t.status === 'DangDung') stateColor = 'bg-red-500 border-red-500 text-white'
              if (t.status === 'DaDat') stateColor = 'bg-coffee-yellow border-coffee-yellow text-coffee-dark'
              if (t.status === 'BaoTri') stateColor = 'bg-gray-400 border-gray-400 text-white'
              if (isSelected) stateColor = 'bg-coffee-green border-coffee-green text-white shadow-lg scale-110 z-20'

              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('tableId', t.id.toString())
                  }}
                  onClick={() => setSelectedTable(t)}
                  className={`absolute flex items-center justify-center border-2 transition-all duration-300 cursor-move shadow-sm hover:scale-105 ${baseClass} ${sizeClass} ${stateColor}`}
                  style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}
                >
                  <span className="text-[0.6rem] md:text-[0.8rem] font-black z-10 leading-none text-center">
                    {t.name}
                  </span>
                  {renderChairs(t.seats, t.type)}
                </div>
              )
            })}
          </div>

          {/* Quick status edit overlay */}
          {selectedTable && (
            <div className="mt-4 p-4 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3 animate-fade-in shadow-inner">
              <span className="text-size-1 font-black text-coffee-dark dark:text-gray-100">
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
                  onClick={() => openEditModal(selectedTable)}
                  className="px-3 py-1.5 rounded-full text-size-0 font-bold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                  title="Sửa thông tin bàn"
                >
                  <i className="fa-solid fa-pen"></i> Sửa Bàn
                </button>
                <button
                  onClick={() => showNotify(`QR Code Đặt Món Bàn ${selectedTable.id} (Tính năng đang phát triển)`)}
                  className="px-3 py-1.5 rounded-full text-size-0 font-bold bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                  title="Tạo QR Order cho khách tự quét gọi món"
                >
                  <i className="fa-solid fa-qrcode"></i> QR Order
                </button>
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
        <div className="glass-effect p-6 rounded-[2rem] border border-white dark:border-slate-800 shadow-md flex flex-col h-full">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark dark:text-gray-100 mb-4">
            Đơn Đặt Chỗ
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[450px]">
            {loadingBookings ? (
              <p className="text-center py-6 text-size-1 font-bold text-gray-400">Đang tải danh sách đặt bàn...</p>
            ) : bookings.length === 0 ? (
              <p className="text-center py-6 text-size-1 font-bold text-gray-400">Không có đơn đặt bàn nào.</p>
            ) : (
              bookings.map((book, idx) => (
                <div key={idx} className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2 text-size-0 font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-size-1 font-black text-coffee-dark dark:text-gray-100">{book.name}</span>
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
                  <p className="text-gray-600 dark:text-gray-300">SĐT: {book.phone}</p>
                  <p className="text-gray-600 dark:text-gray-300">Bàn: <span className="font-bold text-coffee-green dark:text-emerald-400">{book.tableName}</span></p>
                  <p className="text-gray-600 dark:text-gray-300">Thời gian: {book.time}</p>
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

      {showModal && (
        <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect p-8 rounded-[2.5rem] relative max-w-md w-full shadow-2xl border border-white dark:border-slate-800 animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 btn-icon">&times;</button>
            <h3 className="text-size-2 font-black text-coffee-green dark:text-emerald-400 uppercase mb-6 tracking-tighter text-center">
              {editingTable ? 'Sửa Thông Tin Bàn' : 'Thêm Bàn Mới'}
            </h3>
            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên Bàn</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-size-1 font-bold outline-none" placeholder="VD: Bàn 10" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sức Chứa</label>
                <CustomDropdown
                  options={[
                    { value: 2, label: '2 Người (Bàn nhỏ)', icon: 'fa-user', color: 'bg-amber-100 text-amber-800' },
                    { value: 4, label: '4 Người (Bàn tiêu chuẩn)', icon: 'fa-user-group', color: 'bg-emerald-100 text-emerald-800' },
                    { value: 6, label: '6 Người (Bàn gia đình)', icon: 'fa-users', color: 'bg-blue-100 text-blue-800' },
                    { value: 8, label: '8 Người (Bàn nhóm lớn)', icon: 'fa-people-group', color: 'bg-purple-100 text-purple-800' },
                    { value: 10, label: '10+ Người (Bàn tiệc/VIP)', icon: 'fa-crown', color: 'bg-yellow-100 text-yellow-800' }
                  ]}
                  value={formSeats}
                  onChange={(val) => setFormSeats(Number(val))}
                  placeholder="Chọn sức chứa"
                />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng Thái</label>
                <CustomDropdown
                  options={[
                    { value: 'Trong', label: 'Trống', icon: 'fa-check-circle', color: 'bg-green-100 text-green-800' },
                    { value: 'DangDung', label: 'Đang dùng', icon: 'fa-mug-hot', color: 'bg-red-100 text-red-800' },
                    { value: 'DaDat', label: 'Đã đặt trước', icon: 'fa-clock', color: 'bg-amber-100 text-amber-800' },
                    { value: 'BaoTri', label: 'Bảo trì', icon: 'fa-wrench', color: 'bg-gray-100 text-gray-800' }
                  ]}
                  value={formStatus}
                  onChange={(val) => setFormStatus(val)}
                  placeholder="Chọn trạng thái"
                />
              </div>
              <button type="submit" className="w-full btn-primary py-3 mt-4 text-size-1">
                {editingTable ? 'Lưu Thay Đổi' : 'Tạo Bàn'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TablesView
