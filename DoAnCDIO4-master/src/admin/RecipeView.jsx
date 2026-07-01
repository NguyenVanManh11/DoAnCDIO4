import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import CustomDropdown from '../components/CustomDropdown'

const RecipeView = ({ showNotify }) => {
  const [recipes, setRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  
  const [formProdId, setFormProdId] = useState('')
  const [formIngId, setFormIngId] = useState('')
  const [formQty, setFormQty] = useState(20)
  const [formUnit, setFormUnit] = useState('g')
  const [formVersion, setFormVersion] = useState('1.0')

  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  const fetchRecipesAndMetadata = async () => {
    if (!isConfigured) return
    setLoading(true)
    try {
      // 1. Fetch Recipes
      const { data, error } = await supabase
        .from('congthucphache')
        .select(`
          CongThucID,
          SanPhamID,
          NguyenLieuID,
          SoLuongCan,
          DonViTinh,
          PhienBan,
          sanpham:SanPhamID ( TenSanPham ),
          nguyenlieu:NguyenLieuID ( TenNguyenLieu, DonViTinh )
        `)
        .order('SanPhamID', { ascending: true })

      if (error) throw error
      if (data) setRecipes(data)

      // 2. Fetch Products for Dropdown
      const { data: prodData } = await supabase
        .from('sanpham')
        .select('SanPhamID, TenSanPham')
        .eq('DaXoa', false)
      if (prodData && prodData.length > 0) {
        setProducts(prodData)
        if (!formProdId) setFormProdId(prodData[0].SanPhamID)
      }

      // 3. Fetch Ingredients for Dropdown
      const { data: ingData } = await supabase
        .from('nguyenlieu')
        .select('NguyenLieuID, TenNguyenLieu, DonViTinh')
      if (ingData && ingData.length > 0) {
        setIngredients(ingData)
        if (!formIngId) {
          setFormIngId(ingData[0].NguyenLieuID)
          setFormUnit(ingData[0].DonViTinh || 'g')
        }
      }
    } catch (err) {
      console.error('Lỗi tải công thức pha chế:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipesAndMetadata()
  }, [])

  const openAddModal = () => {
    setEditingRecipe(null)
    if (products.length > 0) setFormProdId(products[0].SanPhamID)
    if (ingredients.length > 0) {
      setFormIngId(ingredients[0].NguyenLieuID)
      setFormUnit(ingredients[0].DonViTinh || 'g')
    }
    setFormQty(20)
    setFormVersion('1.0')
    setShowModal(true)
  }

  const openEditModal = (r) => {
    setEditingRecipe(r)
    setFormProdId(r.SanPhamID)
    setFormIngId(r.NguyenLieuID)
    setFormQty(r.SoLuongCan)
    setFormUnit(r.DonViTinh)
    setFormVersion(r.PhienBan || '1.0')
    setShowModal(true)
  }

  const handleDeleteRecipe = async (id, prodName, ingName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa công thức "${ingName}" của món "${prodName}"?`)) return
    if (isConfigured) {
      try {
        await supabase.from('congthucphache').delete().eq('CongThucID', id)
      } catch (err) {
        console.error('Lỗi xóa công thức DB:', err.message)
      }
    }
    setRecipes(prev => prev.filter(r => r.CongThucID !== id))
    showNotify(`Đã xóa công thức: ${prodName}`)
  }

  const handleSaveRecipe = async (e) => {
    e.preventDefault()

    const selectedProd = products.find(p => String(p.SanPhamID) === String(formProdId))
    const selectedIng = ingredients.find(i => String(i.NguyenLieuID) === String(formIngId))

    if (editingRecipe) {
      if (isConfigured) {
        try {
          await supabase.from('congthucphache').update({
            SanPhamID: Number(formProdId),
            NguyenLieuID: Number(formIngId),
            SoLuongCan: Number(formQty),
            DonViTinh: formUnit,
            PhienBan: formVersion
          }).eq('CongThucID', editingRecipe.CongThucID)
        } catch (err) {
          console.error('Lỗi cập nhật công thức DB:', err.message)
        }
      }
      setRecipes(prev => prev.map(r => r.CongThucID === editingRecipe.CongThucID ? {
        ...r,
        SanPhamID: Number(formProdId),
        NguyenLieuID: Number(formIngId),
        SoLuongCan: Number(formQty),
        DonViTinh: formUnit,
        PhienBan: formVersion,
        sanpham: { TenSanPham: selectedProd ? selectedProd.TenSanPham : 'Món uống' },
        nguyenlieu: { TenNguyenLieu: selectedIng ? selectedIng.TenNguyenLieu : 'Nguyên liệu' }
      } : r))
      setShowModal(false)
      showNotify(`Đã cập nhật công thức: ${selectedProd ? selectedProd.TenSanPham : ''}`)
    } else {
      let newRecipe = {
        CongThucID: Date.now(),
        SanPhamID: Number(formProdId),
        NguyenLieuID: Number(formIngId),
        SoLuongCan: Number(formQty),
        DonViTinh: formUnit,
        PhienBan: formVersion,
        sanpham: { TenSanPham: selectedProd ? selectedProd.TenSanPham : 'Món uống' },
        nguyenlieu: { TenNguyenLieu: selectedIng ? selectedIng.TenNguyenLieu : 'Nguyên liệu' }
      }

      if (isConfigured) {
        try {
          const { data, error } = await supabase
            .from('congthucphache')
            .insert({
              SanPhamID: Number(formProdId),
              NguyenLieuID: Number(formIngId),
              SoLuongCan: Number(formQty),
              DonViTinh: formUnit,
              PhienBan: formVersion
            })
            .select(`
              CongThucID,
              SanPhamID,
              NguyenLieuID,
              SoLuongCan,
              DonViTinh,
              PhienBan,
              sanpham:SanPhamID ( TenSanPham ),
              nguyenlieu:NguyenLieuID ( TenNguyenLieu )
            `)
            .single()

          if (!error && data) newRecipe = data
        } catch (err) {
          console.error('Lỗi thêm công thức DB:', err.message)
        }
      }

      setRecipes(prev => [newRecipe, ...prev])
      setShowModal(false)
      showNotify('Thêm công thức thành công!')
    }
  }

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
        <button className="btn-primary py-2.5 px-5 text-size-0 whitespace-nowrap" onClick={openAddModal}>
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
                <th className="pb-4">Phiên Bản</th>
                <th className="pb-4 pr-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.CongThucID} className="border-b border-gray-50 hover:bg-white/40 transition-colors font-bold">
                  <td className="py-4 pl-4 text-coffee-dark text-size-1">{r.sanpham?.TenSanPham || `Món ID: ${r.SanPhamID}`}</td>
                  <td className="py-4 text-gray-600 text-size-1">{r.nguyenlieu?.TenNguyenLieu || `Nguyên liệu ID: ${r.NguyenLieuID}`}</td>
                  <td className="py-4 text-coffee-green text-size-1">{parseFloat(r.SoLuongCan)} {r.DonViTinh}</td>
                  <td className="py-4">
                    <span className="text-[0.7rem] font-black uppercase px-2 py-1 rounded-full border text-blue-600 bg-blue-50 border-blue-100">
                      v{r.PhienBan || '1.0'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(r)} className="btn-icon" title="Sửa">
                        <i className="fa-solid fa-pen text-size-0"></i>
                      </button>
                      <button onClick={() => handleDeleteRecipe(r.CongThucID, r.sanpham?.TenSanPham || r.SanPhamID, r.nguyenlieu?.TenNguyenLieu || r.NguyenLieuID)} className="btn-icon text-red-500 hover:bg-red-500 hover:text-white" title="Xóa">
                        <i className="fa-solid fa-trash text-size-0"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recipes.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Chưa thiết lập công thức định lượng nào.</td>
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
              {editingRecipe ? 'Sửa Công Thức' : 'Thêm Công Thức'}
            </h3>
            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Sản Phẩm</label>
                {products.length > 0 ? (
                  <CustomDropdown
                    options={products.map(p => ({ value: p.SanPhamID, label: p.TenSanPham, icon: 'fa-mug-hot', color: 'bg-amber-100 text-amber-800' }))}
                    value={formProdId}
                    onChange={(val) => setFormProdId(Number(val))}
                    placeholder="Chọn món pha chế"
                  />
                ) : (
                  <input type="number" required value={formProdId} onChange={(e) => setFormProdId(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="ID Món..." />
                )}
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Nguyên Liệu Can</label>
                {ingredients.length > 0 ? (
                  <CustomDropdown
                    options={ingredients.map(i => ({ value: i.NguyenLieuID, label: `${i.TenNguyenLieu} (${i.DonViTinh || ''})`, icon: 'fa-box-open', color: 'bg-emerald-100 text-emerald-800' }))}
                    value={formIngId}
                    onChange={(val) => {
                      setFormIngId(Number(val))
                      const ing = ingredients.find(item => String(item.NguyenLieuID) === String(val))
                      if (ing && ing.DonViTinh) setFormUnit(ing.DonViTinh)
                    }}
                    placeholder="Chọn nguyên liệu"
                  />
                ) : (
                  <input type="number" required value={formIngId} onChange={(e) => setFormIngId(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="ID Nguyên Liệu..." />
                )}
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Định Lượng</label>
                <input type="number" step="0.1" required value={formQty} onChange={(e) => setFormQty(Number(e.target.value))} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="VD: 20" />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Đơn Vị Tính</label>
                <CustomDropdown
                  options={[
                    { value: 'g', label: 'Gram (g)', icon: 'fa-weight-hanging', color: 'bg-amber-100 text-amber-800' },
                    { value: 'ml', label: 'Mililit (ml)', icon: 'fa-tint', color: 'bg-blue-100 text-blue-800' },
                    { value: 'lít', label: 'Lít (l)', icon: 'fa-bottle-water', color: 'bg-blue-50 text-blue-700' },
                    { value: 'kg', label: 'Kilogram (kg)', icon: 'fa-scale-balanced', color: 'bg-amber-50 text-amber-700' },
                    { value: 'muỗng', label: 'Muỗng / Thìa', icon: 'fa-spoon', color: 'bg-purple-100 text-purple-800' },
                    { value: 'gói', label: 'Gói', icon: 'fa-box', color: 'bg-emerald-100 text-emerald-800' }
                  ]}
                  value={formUnit}
                  onChange={(val) => setFormUnit(val)}
                  placeholder="Chọn đơn vị tính"
                />
              </div>
              <div>
                <label className="block text-size-0 font-bold mb-1 ml-2 text-gray-500 uppercase tracking-wider">Phiên Bản</label>
                <input type="text" required value={formVersion} onChange={(e) => setFormVersion(e.target.value)} className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-bold outline-none" placeholder="1.0" />
              </div>
              <button type="submit" className="w-full btn-primary py-3 mt-4 text-size-1">
                {editingRecipe ? 'Lưu Thay Đổi' : 'Tạo Định Lượng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeView
