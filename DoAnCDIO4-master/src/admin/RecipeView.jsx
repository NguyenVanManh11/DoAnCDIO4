import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const RecipeView = ({ showNotify }) => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  const fetchRecipes = async () => {
    if (!isConfigured) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('congthucphache')
        .select(`
          CongThucID,
          SoLuongCan,
          DonViTinh,
          PhienBan,
          sanpham:SanPhamID ( TenSanPham ),
          nguyenlieu:NguyenLieuID ( TenNguyenLieu )
        `)
        .order('SanPhamID', { ascending: true })

      if (error) throw error
      if (data) setRecipes(data)
    } catch (err) {
      console.error('Lỗi tải công thức pha chế:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Quản Lý Định Lượng
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Công thức pha chế chuẩn cho Barista
          </p>
        </div>
        <button className="btn-primary py-2.5 px-5 text-size-0 whitespace-nowrap" onClick={() => showNotify('Tính năng thêm công thức đang phát triển')}>
          <i className="fa-solid fa-flask"></i> Thêm Công Thức
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải công thức...</p>
        </div>
      ) : (
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-size-0 font-black uppercase tracking-wider text-gray-400">
                <th className="pb-4 pl-4">Sản Phẩm</th>
                <th className="pb-4">Nguyên Liệu Cần</th>
                <th className="pb-4">Định Lượng</th>
                <th className="pb-4 pr-4 text-right">Phiên Bản</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.CongThucID} className="border-b border-gray-50 hover:bg-white/40 transition-colors font-bold">
                  <td className="py-4 pl-4 text-coffee-dark text-size-1">{r.sanpham?.TenSanPham}</td>
                  <td className="py-4 text-gray-600 text-size-1">{r.nguyenlieu?.TenNguyenLieu}</td>
                  <td className="py-4 text-coffee-green text-size-1">{parseFloat(r.SoLuongCan)} {r.DonViTinh}</td>
                  <td className="py-4 pr-4 text-right">
                    <span className="text-[0.7rem] font-black uppercase px-2 py-1 rounded-full border text-blue-600 bg-blue-50 border-blue-100">
                      v{r.PhienBan}
                    </span>
                  </td>
                </tr>
              ))}
              {recipes.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">Chưa thiết lập công thức định lượng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RecipeView
