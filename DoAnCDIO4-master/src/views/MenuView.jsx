import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MOCK_PRODUCTS = [
  { SanPhamID: 1, DanhMucID: 1, TenSanPham: 'CÀ PHÊ ĐEN TRUYỀN THỐNG', MoTa: 'Hương vị nguyên bản.', Gia: 25000, icon: 'fa-mug-hot' },
  { SanPhamID: 2, DanhMucID: 1, TenSanPham: 'BẠC XỈU ĐÁ', MoTa: 'Sự kết hợp hoàn hảo.', Gia: 30000, icon: 'fa-mug-saucer' },
  { SanPhamID: 5, DanhMucID: 1, TenSanPham: 'ESPRESSO Ý', MoTa: 'Đậm đà, bừng tỉnh.', Gia: 35000, icon: 'fa-mug-hot' },
  { SanPhamID: 3, DanhMucID: 2, TenSanPham: 'TRÀ ĐÀO CAM SẢ', MoTa: 'Thanh mát giải nhiệt.', Gia: 40000, icon: 'fa-glass-water' },
  { SanPhamID: 6, DanhMucID: 2, TenSanPham: 'TRÀ VẢI THIỀU TỨ XUYÊN', MoTa: 'Vị ngọt thanh dịu nhẹ.', Gia: 45000, icon: 'fa-leaf' },
  { SanPhamID: 4, DanhMucID: 3, TenSanPham: 'BÁNH CROISSANT', MoTa: 'Bánh sừng bò nướng bơ.', Gia: 35000, icon: 'fa-cookie' },
  { SanPhamID: 7, DanhMucID: 3, TenSanPham: 'TIRAMISU', MoTa: 'Béo ngậy hương cà phê.', Gia: 45000, icon: 'fa-cake-candles' },
]

const CATEGORIES = [
  { id: 1, name: 'Cà Phê' },
  { id: 2, name: 'Trà' },
  { id: 3, name: 'Bánh' }
]

const MenuView = ({ onProductSelect }) => {
  const [activeCat, setActiveCat] = useState(1)
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [categories, setCategories] = useState(CATEGORIES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMenuData = async () => {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      if (!isConfigured) return

      setLoading(true)
      try {
        // Fetch Categories
        const { data: catData, error: catErr } = await supabase
          .from('danhmuc')
          .select('DanhMucID, TenDanhMuc')
          .eq('DaXoa', false)

        if (catErr) throw catErr
        if (catData && catData.length > 0) {
          setCategories(catData.map(c => ({ id: c.DanhMucID, name: c.TenDanhMuc })))
        }

        // Fetch Products with Sizes to get base price
        const { data: prodData, error: prodErr } = await supabase
          .from('sanpham')
          .select(`
            SanPhamID,
            DanhMucID,
            TenSanPham,
            MoTa,
            HinhAnh,
            sanphamsize ( Gia )
          `)
          .eq('DaXoa', false)
          .eq('ConBan', true)

        if (prodErr) throw prodErr
        if (prodData && prodData.length > 0) {
          const mapped = prodData.map(p => {
            // Find size S price or lowest price as base
            const prices = p.sanphamsize?.map(s => parseFloat(s.Gia)) || []
            const basePrice = prices.length > 0 ? Math.min(...prices) : 25000
            return {
              SanPhamID: p.SanPhamID,
              DanhMucID: p.DanhMucID,
              TenSanPham: p.TenSanPham,
              MoTa: p.MoTa,
              Gia: basePrice,
              icon: p.HinhAnh || 'fa-mug-hot'
            }
          })
          setProducts(mapped)
        }
      } catch (err) {
        console.error('Lỗi khi tải Menu từ Supabase:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  return (
    <section className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto animate-fade-in">
      <h2 className="text-size-2 font-black uppercase text-coffee-dark text-center mb-8 tracking-tighter">
        Thực Đơn
      </h2>
      
      {/* Category selector */}
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`px-6 py-2.5 rounded-full text-size-1 font-bold uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
              activeCat === c.id
                ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/15'
                : 'glass-effect text-coffee-dark hover:bg-coffee-green/10 hover:text-coffee-green'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
 
      {loading ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải danh sách món...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((p) => p.DanhMucID === activeCat)
            .map((product) => (
              <div
                key={product.SanPhamID}
                className="glass-effect p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 group cursor-pointer hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-white relative overflow-hidden"
                onClick={() => onProductSelect(product)}
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-size-2 text-coffee-green shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <i className={`fa-solid ${product.icon}`}></i>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-size-1 font-black text-coffee-green uppercase mb-2 line-clamp-1">
                    {product.TenSanPham}
                  </h3>
                  <p className="text-size-1 text-gray-600 mb-4 line-clamp-2 h-[3rem] font-medium leading-normal">
                    {product.MoTa}
                  </p>
                  <div className="text-size-1 font-black text-coffee-dark bg-white/60 py-2 rounded-full border border-white/50">
                    {product.Gia.toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <div className="w-full mt-2 overflow-hidden">
                  <button className="w-full btn-accent py-2.5 text-size-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <i className="fa-solid fa-plus mr-1"></i> Chọn Món
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  )
}

export default MenuView
