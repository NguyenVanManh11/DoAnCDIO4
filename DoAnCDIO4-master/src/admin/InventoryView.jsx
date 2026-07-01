import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const InventoryView = ({ showNotify }) => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formName, setFormName] = useState('')
  const [formUnit, setFormUnit] = useState('kg')
  const [formQty, setFormQty] = useState(10)
  const [formMinQty, setFormMinQty] = useState(2)
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  const fetchInventory = async () => {
    if (!isConfigured) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('nguyenlieu')
        .select('*')
        .order('TenNguyenLieu', { ascending: true })

      if (error) throw error
      if (data) setInventory(data)
    } catch (err) {
      console.error('Lỗi tải kho nguyên liệu:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSaveInventory = async (e) => {
    e.preventDefault()
    if (!isConfigured) {
      setInventory(prev => [{
        NguyenLieuID: Date.now(),
        TenNguyenLieu: formName,
        DonViTinh: formUnit,
        SoLuongTon: formQty,
        SoLuongToiThieu: formMinQty
      }, ...prev])
      setShowModal(false)
      showNotify('Nhập kho thành công!')
      return
    }

    try {
      const { data, error } = await supabase
        .from('nguyenlieu')
        .insert({
          TenNguyenLieu: formName,
          DonViTinh: formUnit,
          SoLuongTon: formQty,
          SoLuongToiThieu: formMinQty
        })
        .select()
        .single()

      if (error) throw error
      setInventory(prev => [data, ...prev])
      setShowModal(false)
      showNotify('Nhập kho thành công!')
    } catch (err) {
      console.error('Lỗi khi nhập kho:', err.message)
      alert('Không thể nhập kho. Tên nguyên liệu có thể đã tồn tại.')
    }
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Quản Lý Kho Hàng
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Kiểm soát nguyên liệu và cảnh báo tồn kho (AI Support)
          </p>
        </div>
        <button className="btn-primary py-2.5 px-5 text-size-0 whitespace-nowrap" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-box-open"></i> Nhập Nguyên Liệu
        </button>
      </div>

      {/* Tích hợp AI Cảnh Báo */}
      <div className="bg-coffee-green/10 border border-coffee-green/30 p-6 rounded-3xl flex items-start gap-4">
        <i className="fa-solid fa-robot text-size-2 text-coffee-green animate-pulse"></i>
        <div>
          <h3 className="text-size-1 font-black text-coffee-dark uppercase tracking-widest mb-1">Hệ Thống AI Cảnh Báo Kho</h3>
          <p className="text-size-1 font-medium text-gray-700">Dựa trên dự báo lượng khách cuối tuần này, hệ thống đề xuất nhập thêm: <strong className="text-coffee-green">Cà phê hạt xay (Cần thêm 5kg)</strong> và <strong className="text-coffee-green">Sữa tươi thanh trùng (Cần thêm 10 Lít)</strong> để tránh hết hàng đột xuất.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải dữ liệu kho...</p>
        </div>
      ) : (
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-size-0 font-black uppercase tracking-wider text-gray-400">
                <th className="pb-4 pl-4">Tên Nguyên Liệu</th>
                <th className="pb-4">Đơn Vị</th>
                <th className="pb-4">Tồn Kho</th>
                <th className="pb-4">Mức Tối Thiểu</th>
                <th className="pb-4 pr-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => {
                const isLow = i.SoLuongTon <= i.SoLuongToiThieu;
                return (
                  <tr key={i.NguyenLieuID} className="border-b border-gray-50 hover:bg-white/40 transition-colors font-bold">
                    <td className="py-4 pl-4 text-coffee-dark text-size-1">{i.TenNguyenLieu}</td>
                    <td className="py-4 text-gray-600 text-size-1">{i.DonViTinh}</td>
                    <td className={`py-4 text-size-1 ${isLow ? 'text-red-500' : 'text-coffee-green'}`}>
                      {parseFloat(i.SoLuongTon)}
                    </td>
                    <td className="py-4 text-gray-600 text-size-1">{parseFloat(i.SoLuongToiThieu)}</td>
                    <td className="py-4 pr-4 text-right">
                      <span className={`text-[0.7rem] font-black uppercase px-2 py-1 rounded-full border ${isLow ? 'text-red-500 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-100'}`}>
                        {isLow ? 'Sắp Hết' : 'Ổn Định'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Kho đang trống.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect p-8 rounded-[2.5rem] relative max-w-md w-full shadow-2xl border border-white animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 btn-icon">&times;</button>
            <h3 className="text-size-2 font-black text-coffee-green uppercase mb-6 tracking-tighter text-center">Nhập Nguyên Liệu</h3>
            <form onSubmit={handleSaveInventory} className="space-y-4">
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Tên Nguyên Liệu</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="Hạt Cà Phê Robusta" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Đơn Vị Tính</label>
                <input type="text" required value={formUnit} onChange={(e) => setFormUnit(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="kg" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Số Lượng Tồn</label>
                <input type="number" required value={formQty} onChange={(e) => setFormQty(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="10" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Mức Tối Thiểu Cảnh Báo</label>
                <input type="number" required value={formMinQty} onChange={(e) => setFormMinQty(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="2" />
              </div>
              <button type="submit" className="w-full btn-primary py-3 mt-4 text-size-1">Nhập Kho</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryView
