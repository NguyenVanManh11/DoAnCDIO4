import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const ReportsView = () => {
  const [revenueData, setRevenueData] = useState([
    { label: 'Tháng 1', value: 4500000, pct: 45 },
    { label: 'Tháng 2', value: 6200000, pct: 62 },
    { label: 'Tháng 3', value: 8000000, pct: 80 },
    { label: 'Tháng 4', value: 9500000, pct: 95 },
    { label: 'Tháng 5', value: 7200000, pct: 72 },
    { label: 'Tháng 6', value: 10000000, pct: 100 }
  ])

  const [categoryShares, setCategoryShares] = useState([
    { label: 'Cà phê', value: 120, pct: 60 },
    { label: 'Trà', value: 50, pct: 25 },
    { label: 'Bánh ngọt', value: 30, pct: 15 }
  ])

  useEffect(() => {
    const fetchReportData = async () => {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      if (!isConfigured) return

      try {
        // Query completed orders joining details & categories
        const { data, error } = await supabase
          .from('donhang')
          .select(`
            ThanhTien,
            NgayTao,
            chitietdonhang:chitietdonhang (
              SoLuong,
              sanphamsize:SanPhamSizeID (
                sanpham:SanPhamID (
                  danhmuc:DanhMucID ( TenDanhMuc )
                )
              )
            )
          `)
          .eq('TrangThai', 'HoanThanh')

        if (error) throw error
        if (data && data.length > 0) {
          // 1. Group revenue by month (last 6 months)
          const monthSums = {}
          const catSums = { 'Cà Phê': 0, 'Trà': 0, 'Bánh': 0 }

          data.forEach(o => {
            const date = new Date(o.NgayTao)
            const monthLabel = `Tháng ${date.getMonth() + 1}`
            monthSums[monthLabel] = (monthSums[monthLabel] || 0) + parseFloat(o.ThanhTien || 0)

            o.chitietdonhang?.forEach(detail => {
              const catName = detail.sanphamsize?.sanpham?.danhmuc?.TenDanhMuc
              const qty = detail.SoLuong || 0
              if (catName && catSums[catName] !== undefined) {
                catSums[catName] += qty
              }
            })
          })

          // Map months (fallback if any month is missing)
          const monthsPreset = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6']
          const mappedMonths = monthsPreset.map(m => ({
            label: m,
            value: monthSums[m] || 0
          }))
          const maxVal = Math.max(...mappedMonths.map(m => m.value), 1)
          mappedMonths.forEach(m => {
            m.pct = Math.round((m.value / maxVal) * 100)
          })
          setRevenueData(mappedMonths)

          // Map categories
          const totalQty = Object.values(catSums).reduce((s, v) => s + v, 0) || 1
          const mappedCats = [
            { label: 'Cà phê', value: catSums['Cà Phê'] || 0, pct: Math.round(((catSums['Cà Phê'] || 0) / totalQty) * 100) },
            { label: 'Trà', value: catSums['Trà'] || 0, pct: Math.round(((catSums['Trà'] || 0) / totalQty) * 100) },
            { label: 'Bánh ngọt', value: catSums['Bánh'] || 0, pct: Math.round(((catSums['Bánh'] || 0) / totalQty) * 100) }
          ]
          setCategoryShares(mappedCats)
        }
      } catch (err) {
        console.error('Lỗi khi tải báo cáo thống kê:', err.message)
      }
    }

    fetchReportData()
  }, [])

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
          Báo Cáo Doanh Thu
        </h2>
        <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
          Phân tích doanh số kinh doanh và cơ cấu sản phẩm
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu theo tháng */}
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md flex flex-col">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark mb-8 pl-2">
            Doanh thu 6 tháng gần nhất
          </h3>
          
          {/* Biểu đồ cột */}
          <div className="flex-1 flex items-end justify-between gap-2 h-64 px-4 pb-4 border-b border-gray-100">
            {revenueData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[0.65rem] font-black text-coffee-green opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                  {d.value.toLocaleString()}đ
                </span>
                <div className="w-full bg-gray-100 rounded-t-xl overflow-hidden h-48 flex items-end">
                  <div
                    className="w-full bg-coffee-green rounded-t-xl transition-all duration-1000 origin-bottom"
                    style={{ height: `${d.pct}%` }}
                  ></div>
                </div>
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wide">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cơ cấu danh mục sản phẩm */}
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark mb-6 pl-2">
              Sản phẩm bán chạy nhất
            </h3>
            
            {/* Biểu đồ phần trăm ngang */}
            <div className="space-y-6 py-4">
              {categoryShares.map((cat, idx) => {
                let barColor = 'bg-coffee-green'
                if (idx === 1) barColor = 'bg-coffee-yellow'
                if (idx === 2) barColor = 'bg-coffee-dark'

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-size-1 font-bold">
                      <span className="text-gray-700">{cat.label}</span>
                      <span className="text-coffee-dark">{cat.pct}% ({cat.value} món)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full bar-chart-fill`}
                        style={{ width: `${cat.pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-gray-100 mt-4">
            <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest mb-1">Tổng cộng sản lượng bán</p>
            <p className="text-size-2 font-black text-coffee-green leading-none">
              {categoryShares.reduce((s, c) => s + c.value, 0)} <span className="text-size-0 text-gray-400 font-bold">Ly / Cái</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsView
