import React, { useState } from 'react'

const SIZES = [
  { id: 'S', name: 'Size S', price: 0 },
  { id: 'M', name: 'Size M', price: 5000 },
  { id: 'L', name: 'Size L', price: 10000 }
]

const TOPPINGS = [
  { id: 1, name: 'Trân châu đen', price: 5000 },
  { id: 2, name: 'Kem Macchiato', price: 10000 }
]

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [size, setSize] = useState(SIZES[0])
  const [selectedToppings, setSelectedToppings] = useState([])
  const [qty, setQty] = useState(1)

  if (!product) return null

  const isCake = product.DanhMucID === 3

  const toggleTopping = (t) => {
    if (selectedToppings.find(item => item.id === t.id)) {
      setSelectedToppings(selectedToppings.filter(item => item.id !== t.id))
    } else {
      setSelectedToppings([...selectedToppings, t])
    }
  }

  const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0)
  const basePrice = product.Gia || 0
  const finalPricePerUnit = basePrice + (isCake ? 0 : size.price) + toppingTotal
  const total = finalPricePerUnit * qty

  const handleAdd = () => {
    onAddToCart({
      ...product,
      cartId: Date.now(),
      selectedSize: isCake ? null : size,
      selectedToppings: isCake ? [] : selectedToppings,
      quantity: qty,
      finalPrice: finalPricePerUnit
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">
      <div className="glass-effect p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative max-w-lg w-full max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl border border-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 btn-icon"
        >
          &times;
        </button>

        <div className="flex items-center gap-4 mb-6 border-b-2 border-white/50 pb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-size-2 text-coffee-green shadow-sm shrink-0">
            <i className={`fa-solid ${product.icon || 'fa-mug-hot'}`}></i>
          </div>
          <div>
            <h2 className="text-size-1 font-black text-coffee-green uppercase">{product.TenSanPham}</h2>
            <p className="text-size-1 text-gray-600 font-bold">{basePrice.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>

        {!isCake && (
          <>
            <div className="mb-6">
              <p className="text-size-0 font-black uppercase mb-3 text-gray-500 ml-2 tracking-wider">Chọn Size</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s)}
                    className={`p-3 rounded-2xl text-size-1 font-bold border transition-all duration-300 hover:scale-105 active:scale-95 ${
                      size.id === s.id
                        ? 'bg-coffee-green text-white border-coffee-green shadow-md shadow-coffee-green/15'
                        : 'bg-white/70 border-white hover:bg-white text-gray-600'
                    }`}
                  >
                    {s.name} <br />
                    <span className="opacity-80 text-[0.8rem]">(+{s.price.toLocaleString()}đ)</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-size-0 font-black uppercase mb-3 text-gray-500 ml-2 tracking-wider">Thêm Topping</p>
              <div className="space-y-2">
                {TOPPINGS.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 border border-white cursor-pointer hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      className="w-6 h-6 accent-coffee-green rounded cursor-pointer"
                      checked={!!selectedToppings.find(item => item.id === t.id)}
                      onChange={() => toggleTopping(t)}
                    />
                    <span className="text-size-1 font-bold flex-1 text-gray-700">{t.name}</span>
                    <span className="text-size-1 font-black text-coffee-green">+{t.price.toLocaleString()}đ</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between mb-8 bg-white/70 p-4 rounded-2xl border border-white">
          <p className="text-size-0 font-black uppercase text-gray-500 ml-2 tracking-wider">Số lượng</p>
          <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 rounded-full bg-white text-size-1 font-black text-gray-600 hover:text-coffee-green hover:bg-gray-50 hover:scale-110 active:scale-90 transition-all shadow-sm flex items-center justify-center"
            >
              -
            </button>
            <span className="w-12 text-center text-size-1 font-black">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 rounded-full bg-white text-size-1 font-black text-gray-600 hover:text-coffee-green hover:bg-gray-50 hover:scale-110 active:scale-90 transition-all shadow-sm flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full btn-accent py-3.5 mt-2 text-size-1"
        >
          Thêm vào giỏ - {total.toLocaleString('vi-VN')} đ
        </button>
      </div>
    </div>
  )
}

export default ProductModal
