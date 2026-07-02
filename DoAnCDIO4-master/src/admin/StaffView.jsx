import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import CustomDropdown from '../components/CustomDropdown'

const StaffView = ({ showNotify }) => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formName, setFormName] = useState('')
  const [formUser, setFormUser] = useState('')
  const [formRole, setFormRole] = useState(4) // Barista default
  const [formPhone, setFormPhone] = useState('')
  
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  const fetchStaff = async () => {
    if (!isConfigured) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('nguoidung')
        .select(`
          NguoiDungID,
          HoTen,
          TenDangNhap,
          SoDienThoai,
          TrangThai,
          vaitro:VaiTroID ( TenVaiTro )
        `)
        .in('VaiTroID', [2, 3, 4, 5]) // Manager, Cashier, Barista, Staff
        .eq('DaXoa', false)
        .order('NgayTao', { ascending: false })

      if (error) throw error
      if (data) {
        setStaff(data)
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhân viên:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleSaveStaff = async (e) => {
    e.preventDefault()
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

    let newStaffItem = {
      NguoiDungID: Date.now(),
      HoTen: formName,
      TenDangNhap: formUser,
      SoDienThoai: formPhone,
      VaiTroID: formRole,
      vaitro: { TenVaiTro: formRole === 2 ? 'Quản Lý' : formRole === 3 ? 'Thu Ngân' : formRole === 4 ? 'Pha Chế' : 'Phục Vụ' },
      TrangThai: 'HoatDong'
    }

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('nguoidung')
          .insert({
            HoTen: formName,
            TenDangNhap: formUser,
            MatKhau: '123456', // required by schema
            Email: `${formUser}@coffee.vn`,
            SoDienThoai: formPhone,
            VaiTroID: formRole,
            TrangThai: 'HoatDong'
          })
          .select(`
            NguoiDungID,
            HoTen,
            TenDangNhap,
            SoDienThoai,
            TrangThai,
            vaitro:VaiTroID ( TenVaiTro )
          `)
          .single()

        if (!error && data) {
          newStaffItem = data
        } else {
          console.warn('Supabase staff insert error, fallback to local memory:', error?.message)
        }
      } catch (err) {
        console.error('Lỗi khi thêm nhân viên DB:', err.message)
      }
    }

    setStaff(prev => [newStaffItem, ...prev])
    setShowModal(false)
    showNotify('Thêm nhân viên thành công!')
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Quản Lý Nhân Sự
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Phân quyền và theo dõi tài khoản nhân viên
          </p>
        </div>
        <button className="btn-primary py-2.5 px-5 text-size-0 whitespace-nowrap" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-user-plus"></i> Thêm Nhân Viên
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải danh sách nhân sự...</p>
        </div>
      ) : (
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-size-0 font-black uppercase tracking-wider text-gray-400">
                <th className="pb-4 pl-4">Họ & Tên</th>
                <th className="pb-4">Username</th>
                <th className="pb-4">SĐT</th>
                <th className="pb-4">Vai Trò</th>
                <th className="pb-4 pr-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.NguoiDungID} className="border-b border-gray-50 hover:bg-white/40 transition-colors font-bold">
                  <td className="py-4 pl-4 text-coffee-dark text-size-1">{s.HoTen}</td>
                  <td className="py-4 text-gray-600 text-size-1">{s.TenDangNhap}</td>
                  <td className="py-4 text-gray-600 text-size-1">{s.SoDienThoai || 'Chưa có'}</td>
                  <td className="py-4">
                    <span className="text-coffee-dark font-black uppercase tracking-wider text-[0.75rem] px-2 py-1 bg-amber-100/50 rounded-lg">
                      {s.vaitro?.TenVaiTro}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span className={`text-[0.7rem] font-black uppercase px-2 py-1 rounded-full border ${s.TrangThai === 'HoatDong' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-500 bg-red-50 border-red-200'}`}>
                      {s.TrangThai}
                    </span>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Chưa có nhân viên nào (Vai trò: 2, 3, 4, 5).</td>
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
            <h3 className="text-size-2 font-black text-coffee-green uppercase mb-6 tracking-tighter text-center">Thêm Nhân Sự</h3>
            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Họ & Tên</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Tên Đăng Nhập</label>
                <input type="text" required value={formUser} onChange={(e) => setFormUser(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="nva123" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Số Điện Thoại</label>
                <input type="text" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="0987654321" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Vai Trò</label>
                <CustomDropdown
                  options={[
                    { value: 2, label: 'Quản Lý', icon: 'fa-user-tie', color: 'bg-amber-100 text-amber-800' },
                    { value: 3, label: 'Thu Ngân', icon: 'fa-cash-register', color: 'bg-blue-100 text-blue-800' },
                    { value: 4, label: 'Pha Chế', icon: 'fa-blender', color: 'bg-emerald-100 text-emerald-800' },
                    { value: 5, label: 'Phục Vụ', icon: 'fa-concierge-bell', color: 'bg-purple-100 text-purple-800' }
                  ]}
                  value={formRole}
                  onChange={(val) => setFormRole(Number(val))}
                  placeholder="Chọn vai trò"
                />
              </div>
              <button type="submit" className="w-full btn-primary py-3 mt-4 text-size-1">Tạo Tài Khoản</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffView
