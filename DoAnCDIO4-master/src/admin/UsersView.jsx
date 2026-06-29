import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn Khách', username: 'khachhang', phone: '0987654321', email: 'customer@coffee.com', points: 1250, rank: 'Gold', status: 'HoatDong' },
  { id: 3, name: 'Trần Văn Khách', username: 'tran_khach', phone: '0981234567', email: 'tran@coffee.com', points: 450, rank: 'Silver', status: 'HoatDong' },
  { id: 4, name: 'Lê Thị Khách', username: 'le_khach', phone: '0909998887', email: 'le@coffee.com', points: 5200, rank: 'Diamond', status: 'BiKhoa' }
]

const UsersView = ({ showNotify }) => {
  const [users, setUsers] = useState(MOCK_USERS)
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('nguoidung')
        .select(`
          NguoiDungID,
          HoTen,
          TenDangNhap,
          Email,
          SoDienThoai,
          TongDiem,
          TrangThai,
          hangthanhvien:hangthanhvien ( TenHang )
        `)
        .eq('VaiTroID', 6) // Load Customers only
        .eq('DaXoa', false)
        .order('NgayTao', { ascending: false })

      if (error) throw error
      if (data) {
        const mapped = data.map(u => ({
          id: u.NguoiDungID,
          name: u.HoTen,
          username: u.TenDangNhap,
          phone: u.SoDienThoai || 'Chưa có',
          email: u.Email || 'Chưa có',
          points: u.TongDiem || 0,
          rank: u.hangthanhvien?.TenHang || 'Silver',
          status: u.TrangThai || 'HoatDong'
        }))
        setUsers(mapped)
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách hàng:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleUserStatus = async (userObj) => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    const newStatus = userObj.status === 'HoatDong' ? 'BiKhoa' : 'HoatDong'
    const statusLabel = newStatus === 'BiKhoa' ? 'KHÓA' : 'MỞ KHÓA'

    if (!window.confirm(`Bạn có chắc chắn muốn ${statusLabel} tài khoản "${userObj.name}"?`)) return

    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('nguoidung')
          .update({ TrangThai: newStatus })
          .eq('NguoiDungID', userObj.id)

        if (error) throw error
      }

      setUsers(prev =>
        prev.map(u => (u.id === userObj.id ? { ...u, status: newStatus } : u))
      )
      showNotify(`Đã ${statusLabel} tài khoản ${userObj.name}!`)
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái tài khoản:', err.message)
    }
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Quản Lý Khách Hàng
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Theo dõi hạng hội viên, tích điểm, và trạng thái tài khoản
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải danh sách hội viên...</p>
        </div>
      ) : (
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-size-0 font-black uppercase tracking-wider text-gray-400">
                <th className="pb-4 pl-4">Họ & Tên</th>
                <th className="pb-4">Username</th>
                <th className="pb-4">Điện thoại</th>
                <th className="pb-4">Tích điểm</th>
                <th className="pb-4">Hạng</th>
                <th className="pb-4">Trạng thái</th>
                <th className="pb-4 pr-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-white/40 transition-colors text-size-1 font-bold">
                  <td className="py-4 pl-4 text-coffee-dark">{u.name}</td>
                  <td className="py-4 text-gray-600 font-medium">{u.username}</td>
                  <td className="py-4 text-gray-600 font-medium">{u.phone}</td>
                  <td className="py-4 text-coffee-yellow">{u.points.toLocaleString()}đ</td>
                  <td className="py-4">
                    <span className="text-coffee-green font-black uppercase tracking-wider text-size-0">
                      {u.rank}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-[0.7rem] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      u.status === 'HoatDong'
                        ? 'text-green-600 bg-green-50 border-green-100'
                        : 'text-red-500 bg-red-50 border-red-100'
                    }`}>
                      {u.status === 'HoatDong' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={
                        u.status === 'HoatDong'
                          ? 'btn-danger px-4 py-1.5 text-size-0'
                          : 'btn-primary px-4 py-1.5 text-size-0'
                      }
                    >
                      {u.status === 'HoatDong' ? 'Khóa' : 'Mở Khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UsersView
