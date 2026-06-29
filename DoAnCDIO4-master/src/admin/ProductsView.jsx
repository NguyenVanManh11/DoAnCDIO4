import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const INITIAL_PRODUCTS = [
  { id: 1, categoryId: 1, name: 'CÀ PHÊ ĐEN TRUYỀN THỐNG', desc: 'Hương vị nguyên bản.', price: 25000, icon: 'fa-mug-hot' },
  { id: 2, categoryId: 1, name: 'BẠC XỈU ĐÁ', desc: 'Sự kết hợp hoàn hảo.', price: 30000, icon: 'fa-mug-saucer' },
  { id: 3, categoryId: 2, name: 'TRÀ ĐÀO CAM SẢ', desc: 'Thanh mát giải nhiệt.', price: 40000, icon: 'fa-glass-water' },
  { id: 4, categoryId: 3, name: 'BÁNH CROISSANT', desc: 'Bánh sừng bò nướng bơ.', price: 35000, icon: 'fa-cookie' }
]

const CATEGORIES = [
  { id: 1, name: 'Cà Phê' },
  { id: 2, name: 'Trà' },
  { id: 3, name: 'Bánh' }
]

const ProductsView = ({ showNotify }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState(1)
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState(25000)
  const [formIcon, setFormIcon] = useState('fa-mug-hot')

  const fetchProducts = async () => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!isConfigured) return

    setLoading(true)
    try {
      const { data, error } = await supabase
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

      if (error) throw error
      if (data) {
        const mapped = data.map(p => {
          const prices = p.sanphamsize?.map(s => parseFloat(s.Gia)) || []
          const basePrice = prices.length > 0 ? Math.min(...prices) : 25000
          return {
            id: p.SanPhamID,
            categoryId: p.DanhMucID,
            name: p.TenSanPham,
            desc: p.MoTa || '',
            price: basePrice,
            icon: p.HinhAnh || 'fa-mug-hot'
          }
        })
        setProducts(mapped)
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormName('')
    setFormCategory(1)
    setFormDesc('')
    setFormPrice(25000)
    setFormIcon('fa-mug-hot')
    setShowModal(true)
  }

  const openEditModal = (p) => {
    setEditingProduct(p)
    setFormName(p.name)
    setFormCategory(p.categoryId)
    setFormDesc(p.desc)
    setFormPrice(p.price)
    setFormIcon(p.icon)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      if (editingProduct) {
        // Edit flow
        if (isConfigured) {
          // 1. Update Product details
          const { error: prodErr } = await supabase
            .from('sanpham')
            .update({
              TenSanPham: formName,
              DanhMucID: formCategory,
              MoTa: formDesc,
              HinhAnh: formIcon
            })
            .eq('SanPhamID', editingProduct.id)

          if (prodErr) throw prodErr

          // 2. Update size S price (default base price)
          // Look up size S for this product
          const { data: sizes } = await supabase
            .from('sanphamsize')
            .select('SanPhamSizeID')
            .eq('SanPhamID', editingProduct.id)
            .eq('KichThuoc', 'S')
            .maybeSingle()

          if (sizes) {
            await supabase
              .from('sanphamsize')
              .update({ Gia: formPrice })
              .eq('SanPhamSizeID', sizes.SanPhamSizeID)
          } else {
            // If somehow doesn't exist, insert sizes
            await supabase
              .from('sanphamsize')
              .insert([
                { SanPhamID: editingProduct.id, KichThuoc: 'S', Gia: formPrice, Calories: 100 },
                { SanPhamID: editingProduct.id, KichThuoc: 'M', Gia: formPrice + 5000, Calories: 150 },
                { SanPhamID: editingProduct.id, KichThuoc: 'L', Gia: formPrice + 10000, Calories: 200 }
              ])
          }
        }

        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, name: formName, categoryId: parseInt(formCategory), desc: formDesc, price: formPrice, icon: formIcon }
              : p
          )
        )
        showNotify(`Đã sửa sản phẩm: ${formName}`)
      } else {
        // Add flow
        let newId = Date.now()

        if (isConfigured) {
          // 1. Insert product
          const { data: newProd, error: prodErr } = await supabase
            .from('sanpham')
            .insert({
              TenSanPham: formName,
              DanhMucID: formCategory,
              MoTa: formDesc,
              HinhAnh: formIcon,
              ConBan: true
            })
            .select()
            .single()

          if (prodErr) throw prodErr
          newId = newProd.SanPhamID

          // 2. Insert corresponding product sizes (S, M, L)
          const { error: sizeErr } = await supabase
            .from('sanphamsize')
            .insert([
              { SanPhamID: newId, KichThuoc: 'S', Gia: formPrice, Calories: 100 },
              { SanPhamID: newId, KichThuoc: 'M', Gia: formPrice + 5000, Calories: 150 },
              { SanPhamID: newId, KichThuoc: 'L', Gia: formPrice + 10000, Calories: 200 }
            ])

          if (sizeErr) throw sizeErr
        }

        setProducts(prev => [
          ...prev,
          { id: newId, categoryId: parseInt(formCategory), name: formName, desc: formDesc, price: formPrice, icon: formIcon }
        ])
        showNotify(`Đã thêm sản phẩm: ${formName}`)
      }
      setShowModal(false)
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err.message)
    }
  }

  const handleDelete = async (pId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      if (isConfigured) {
        // Soft delete: DaXoa = true
        const { error } = await supabase
          .from('sanpham')
          .update({ DaXoa: true })
          .eq('SanPhamID', pId)

        if (error) throw error
      }

      setProducts(prev => prev.filter(p => p.id !== pId))
      showNotify(`Đã xóa sản phẩm: ${name}`)
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err.message)
    }
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
            Danh Mục Sản Phẩm
          </h2>
          <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
            Quản lý thực đơn và định giá đồ uống
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary py-2.5 px-5 text-size-0"
        >
          <i className="fa-solid fa-plus"></i> Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
          <i className="fa-solid fa-spinner animate-spin text-size-2 text-coffee-green mb-4"></i>
          <p className="text-size-1 font-bold text-gray-500">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="glass-effect p-5 rounded-[2rem] border border-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-coffee-green text-size-1 shrink-0 shadow-sm">
                  <i className={`fa-solid ${p.icon}`}></i>
                </div>
                <div className="min-w-0">
                  <h3 className="text-size-1 font-black text-coffee-dark truncate">{p.name}</h3>
                  <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">
                    {CATEGORIES.find(c => c.id === p.categoryId)?.name || 'Khác'}
                  </span>
                  <span className="text-size-0 font-black text-coffee-green block mt-1">
                    {p.price.toLocaleString()}đ
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(p)}
                  className="btn-icon"
                  title="Sửa"
                >
                  <i className="fa-solid fa-pen text-size-0"></i>
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="btn-icon text-red-500 border-red-100/50 hover:bg-red-500 hover:text-white bg-red-50/50"
                  title="Xóa"
                >
                  <i className="fa-solid fa-trash text-size-0"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect p-8 rounded-[2.5rem] relative max-w-md w-full shadow-2xl border border-white animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 btn-icon"
            >
              &times;
            </button>
            
            <h3 className="text-size-2 font-black text-coffee-green uppercase mb-6 tracking-tighter text-center">
              {editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Tên món</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none"
                  placeholder="Bạc xỉu đá..."
                />
              </div>

              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Danh mục</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none appearance-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Giá cơ bản (Size S)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseInt(e.target.value))}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none"
                  placeholder="30000"
                />
              </div>

              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Biểu tượng FontAwesome</label>
                <input
                  type="text"
                  required
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none"
                  placeholder="fa-mug-hot"
                />
              </div>

              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Mô tả ngắn</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-medium outline-none resize-none"
                  rows="2"
                  placeholder="Hương vị đậm đà ngậy ngậy..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 mt-4 text-size-1"
              >
                Lưu lại
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsView
