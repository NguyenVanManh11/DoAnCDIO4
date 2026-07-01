import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import CustomDropdown from '../components/CustomDropdown'

const VoucherView = ({ showNotify }) => {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState('PhanTram')
  const [formValue, setFormValue] = useState(10)
  const [formMinOrder, setFormMinOrder] = useState(50000)
  const [formQty, setFormQty] = useState(100)
  
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  const fetchVouchers = async () => {
    if (!isConfigured) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('voucher')
        .select('*')
        .eq('DaXoa', false)
        .order('NgayTao', { ascending: false })

      if (error) throw error
      if (data) setVouchers(data)
    } catch (err) {
      console.error('Lỗi tải voucher:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const openAddModal = () => {
    setEditingVoucher(null)
    setFormCode('')
    setFormType('PhanTram')
    setFormValue(10)
    setFormMinOrder(50000)
    setFormQty(100)
    setShowModal(true)
  }

  const openEditModal = (v) => {
    setEditingVoucher(v)
    setFormCode(v.MaVoucher)
    setFormType(v.LoaiGiamGia)
    setFormValue(v.GiaTriGiam)
    setFormMinOrder(v.DonHangToiThieu)
    setFormQty(v.SoLuong)
    setShowModal(true)
  }

  const handleDeleteVoucher = async (vId, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa voucher "${code}"?`)) return
    if (isConfigured) {
      try {
        await supabase.from('voucher').update({ DaXoa: true }).eq('VoucherID', vId)
      } catch (err) {
        console.error('Lỗi xóa voucher DB:', err.message)
      }
    }
    setVouchers(prev => prev.filter(v => v.VoucherID !== vId))
    showNotify(`Đã xóa voucher: ${code}`)
  }

  const handleSaveVoucher = async (e) => {
    e.preventDefault()

    if (editingVoucher) {
      if (isConfigured) {
        try {
          await supabase.from('voucher').update({
            MaVoucher: formCode,
            LoaiGiamGia: formType,
            GiaTriGiam: formValue,
            DonHangToiThieu: formMinOrder,
            SoLuong: formQty
          }).eq('VoucherID', editingVoucher.VoucherID)
        } catch (err) {
          console.error('Lỗi khi cập nhật voucher DB:', err.message)
        }
      }
      setVouchers(prev => prev.map(v => v.VoucherID === editingVoucher.VoucherID ? {
        ...v,
        MaVoucher: formCode,
        LoaiGiamGia: formType,
        GiaTriGiam: Number(formValue),
        DonHangToiThieu: Number(formMinOrder),
        SoLuong: Number(formQty)
      } : v))
      setShowModal(false)
      showNotify(`Đã cập nhật voucher: ${formCode}`)
    } else {
      let newVoucher = {
        VoucherID: Date.now(),
        MaVoucher: formCode,
        LoaiGiamGia: formType,
        GiaTriGiam: Number(formValue),
        DonHangToiThieu: Number(formMinOrder),
        SoLuong: Number(formQty),
        TrangThai: 'HoatDong'
      }

      if (isConfigured) {
        try {
          const { data, error } = await supabase
            .from('voucher')
            .insert({
              MaVoucher: formCode,
              LoaiGiamGia: formType,
              GiaTriGiam: Number(formValue),
              DonHangToiThieu: Number(formMinOrder),
              SoLuong: Number(formQty),
              TrangThai: 'HoatDong'
            })
            .select()
            .single()

          if (!error && data) newVoucher = data
        } catch (err) {
          console.error('Lỗi khi thêm voucher DB:', err.message)
        }
      }

      setVouchers(prev => [newVoucher, ...prev])
      setShowModal(false)
      showNotify('Thêm voucher thành công!')
    }
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Quản Lý Khuyến Mãi
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Phát hành và theo dõi Voucher
          </p>
        </div>
        <button className="btn-primary py-2.5 px-5 text-size-0 whitespace-nowrap" onClick={openAddModal}>
          <i className="fa-solid fa-ticket"></i> Thêm Voucher
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải danh sách voucher...</p>
        </div>
      ) : (
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-size-0 font-black uppercase tracking-wider text-gray-400">
                <th className="pb-4 pl-4">Mã Khuyến Mãi</th>
                <th className="pb-4">Loại Giảm</th>
                <th className="pb-4">Mức Giảm</th>
                <th className="pb-4">Đơn Tối Thiểu</th>
                <th className="pb-4">Số Lượng</th>
                <th className="pb-4 pr-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.VoucherID} className="border-b border-gray-50 hover:bg-white/40 transition-colors font-bold">
                  <td className="py-4 pl-4 text-coffee-dark text-size-1">{v.MaVoucher}</td>
                  <td className="py-4 text-gray-600 text-size-1">{v.LoaiGiamGia === 'TienMat' ? 'Tiền Mặt' : 'Phần Trăm'}</td>
                  <td className="py-4 text-coffee-green text-size-1">
                    {v.LoaiGiamGia === 'TienMat' ? `${parseFloat(v.GiaTriGiam).toLocaleString()}đ` : `${v.GiaTriGiam}%`}
                  </td>
                  <td className="py-4 text-gray-600 text-size-1">{parseFloat(v.DonHangToiThieu).toLocaleString()}đ</td>
                  <td className="py-4 text-gray-600 text-size-1">{v.SoLuong}</td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[0.7rem] font-black uppercase px-2 py-1 rounded-full border ${v.TrangThai === 'HoatDong' ? 'text-green-600 bg-green-50 border-green-100' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                        {v.TrangThai}
                      </span>
                      <button onClick={() => openEditModal(v)} className="btn-icon" title="Sửa">
                        <i className="fa-solid fa-pen text-size-0"></i>
                      </button>
                      <button onClick={() => handleDeleteVoucher(v.VoucherID, v.MaVoucher)} className="btn-icon text-red-500 hover:bg-red-500 hover:text-white" title="Xóa">
                        <i className="fa-solid fa-trash text-size-0"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">Chưa có voucher nào.</td>
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
            <h3 className="text-size-2 font-black text-coffee-green uppercase mb-6 tracking-tighter text-center">
              {editingVoucher ? 'Sửa Voucher' : 'Thêm Voucher'}
            </h3>
            <form onSubmit={handleSaveVoucher} className="space-y-4">
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Mã Khuyến Mãi</label>
                <input type="text" required value={formCode} onChange={(e) => setFormCode(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="VD: SUMMER10" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Loại Giảm Giá</label>
                <CustomDropdown
                  options={[
                    { value: 'PhanTram', label: 'Phần Trăm (%)', icon: 'fa-percent', color: 'bg-amber-100 text-amber-800' },
                    { value: 'TienMat', label: 'Tiền Mặt (VNĐ)', icon: 'fa-money-bill', color: 'bg-emerald-100 text-emerald-800' }
                  ]}
                  value={formType}
                  onChange={(val) => setFormType(val)}
                  placeholder="Chọn loại giảm giá"
                />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Mức Giảm</label>
                <input type="number" required value={formValue} onChange={(e) => setFormValue(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="10" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Đơn Tối Thiểu</label>
                <input type="number" required value={formMinOrder} onChange={(e) => setFormMinOrder(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="50000" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Số Lượng</label>
                <input type="number" required value={formQty} onChange={(e) => setFormQty(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="100" />
              </div>
              <button type="submit" className="w-full btn-primary py-3 mt-4 text-size-1">
                {editingVoucher ? 'Cập Nhật Voucher' : 'Tạo Voucher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoucherView
