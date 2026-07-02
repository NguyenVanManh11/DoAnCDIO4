import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

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

const BookingView = ({ user, showNotify, onRequireLogin }) => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [tables, setTables] = useState([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTables = async () => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    try {
      const { data, error } = await supabase
        .from('ban')
        .select('*')
        .order('BanID')

      if (error) throw error
      if (data && data.length > 0) {
        // Map DB tables to layout positions (Realtime from DB)
        const mapped = data.map((t, idx) => {
          const fallbackPos = TABLE_POSITIONS[idx % TABLE_POSITIONS.length] || { left: '50%', top: '50%' }
          return {
            id: t.BanID,
            name: t.TenBan,
            seats: t.SucChua,
            type: t.SucChua > 4 ? 'rect' : 'round',
            top: t.ToaDoY || fallbackPos.top,
            left: t.ToaDoX || fallbackPos.left,
            status: t.TrangThai,
            locked: t.TrangThai !== 'Trong'
          }
        })
        setTables(mapped)
      }
    } catch (err) {
      console.error('Lỗi khi tải sơ đồ bàn:', err.message)
    }
  }

  useEffect(() => {
    fetchTables()

    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    const channel = supabase
      .channel('customer_ban_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ban' },
        () => {
          fetchTables()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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

  const handleBook = async (e) => {
    e.preventDefault()
    if (!user) {
      onRequireLogin()
      return
    }
    if (!selectedTable) return

    setLoading(true)
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      if (isConfigured) {
        // Insert booking request
        const combinedDateTime = `${date}T${time}:00`
        const { error } = await supabase
          .from('datban')
          .insert({
            KhachHangID: user.NguoiDungID,
            BanID: selectedTable.id,
            ThoiGianDat: new Date(combinedDateTime).toISOString(),
            SoNguoi: selectedTable.seats,
            GhiChu: note,
            TrangThai: 'ChoXacNhan'
          })

        if (error) throw error

        // Update table status to DaDat immediately to lock it in real-time
        await supabase
          .from('ban')
          .update({ TrangThai: 'DaDat' })
          .eq('BanID', selectedTable.id)
      }

      showNotify(`Đã gửi yêu cầu đặt ${selectedTable.name} thành công! Quán sẽ liên hệ sớm nhất.`)
      setSelectedTable(null)
      setDate('')
      setTime('')
      setNote('')
    } catch (err) {
      console.error('Lỗi khi đăng ký đặt bàn:', err.message)
      alert('Đã xảy ra lỗi khi gửi yêu cầu đặt bàn. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
      <h2 className="text-size-2 font-black uppercase text-coffee-dark dark:text-emerald-400 text-center mb-8 tracking-tighter">
        Đặt Bàn Giữ Chỗ
      </h2>
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sơ đồ bản đồ */}
        <div className="w-full lg:w-[65%] glass-effect p-4 md:p-6 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark dark:text-gray-100">
              Sơ Đồ Không Gian
            </h3>
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-size-1 font-bold dark:text-gray-300">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 bg-white dark:bg-slate-800"></div> Trống
              </span>
              <span className="flex items-center gap-1.5 text-size-1 font-bold dark:text-gray-300">
                <div className="w-3.5 h-3.5 rounded-full bg-coffee-green border-2 border-coffee-green"></div> Đang chọn
              </span>
              <span className="flex items-center gap-1.5 text-size-1 font-bold dark:text-gray-300">
                <div className="w-3.5 h-3.5 rounded-full bg-coffee-yellow border-2 border-coffee-yellow"></div> Đã đặt
              </span>
              <span className="flex items-center gap-1.5 text-size-1 font-bold dark:text-gray-300">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-red-500"></div> Đang dùng
              </span>
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-white/50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden shadow-inner">
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
              <span className="text-size-1 font-black uppercase">Quầy Bar</span>
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
              
              let stateClass =
                'bg-white border-gray-300 text-gray-700 hover:border-coffee-green hover:shadow-md cursor-pointer'
              if (t.status === 'DangDung') {
                stateClass = 'bg-red-500 border-red-500 text-white opacity-80 cursor-not-allowed'
              } else if (t.status === 'DaDat') {
                stateClass = 'bg-coffee-yellow border-coffee-yellow text-coffee-dark opacity-80 cursor-not-allowed'
              } else if (t.status === 'BaoTri') {
                stateClass = 'bg-gray-400 border-gray-400 text-white opacity-60 cursor-not-allowed'
              }
              if (isSelected) {
                stateClass = 'bg-coffee-green border-coffee-green text-white shadow-lg scale-110 z-20'
              }

              return (
                <div
                  key={t.id}
                  className={`absolute flex items-center justify-center border-2 transition-all duration-300 ${baseClass} ${sizeClass} ${stateClass}`}
                  style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}
                  onClick={() => !t.locked && setSelectedTable(prev => (prev?.id === t.id ? null : t))}
                >
                  <span className="text-[0.6rem] md:text-[0.8rem] font-black z-10 leading-none text-center">
                    {t.locked ? <i className="fa-solid fa-lock"></i> : t.name}
                  </span>
                  {renderChairs(t.seats, t.type)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form chi tiết đặt bàn */}
        <div className="w-full lg:w-[35%] glass-effect p-6 md:p-8 rounded-[2.5rem] shadow-xl shrink-0 border border-white dark:border-slate-800">
          <h3 className="text-size-1 font-black uppercase text-coffee-dark dark:text-gray-100 tracking-widest mb-6">
            Chi tiết đặt bàn
          </h3>
          {!selectedTable && (
            <p className="text-red-500 text-size-1 font-bold mb-4 animate-pulse">
              <i className="fa-solid fa-hand-pointer mr-2"></i>Vui lòng chọn bàn trên sơ đồ!
            </p>
          )}
          <form onSubmit={handleBook} className="space-y-4">
            <div className="bg-white/80 dark:bg-slate-800 p-4 rounded-2xl border border-white dark:border-slate-700">
              <p className="text-size-0 font-bold text-gray-500 dark:text-gray-400 mb-1">Bàn đã chọn</p>
              <p className="text-size-1 font-black text-coffee-green dark:text-emerald-400">
                {selectedTable ? `${selectedTable.name} (${selectedTable.seats} ghế)` : '---'}
              </p>
            </div>
            <div>
              <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày đến</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedTable}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giờ đến</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedTable}
              />
            </div>
            <div>
              <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ghi chú</label>
              <textarea
                rows="2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-medium outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedTable}
                placeholder="Lời dặn thêm cho nhà hàng..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={!selectedTable || loading}
              className={`w-full mt-4 ${
                selectedTable && !loading ? 'btn-primary py-3.5' : 'btn-inactive py-3.5'
              }`}
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Xác Nhận Đặt Bàn'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default BookingView
