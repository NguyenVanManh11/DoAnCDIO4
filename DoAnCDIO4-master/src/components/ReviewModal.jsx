import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

const ReviewModal = ({ order, item, onClose, onSubmit, user }) => {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!item) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const reviewData = {
      KhachHangID: user?.NguoiDungID || 1,
      SanPhamID: item.SanPhamID,
      DonHangID: order.id_db || null, // Database PK DonHangID
      SoSao: rating,
      BinhLuan: comment
    }

    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

      if (isConfigured && reviewData.DonHangID) {
        // Upsert review in PostgreSQL
        const { error } = await supabase
          .from('danhgia')
          .upsert({
            KhachHangID: reviewData.KhachHangID,
            SanPhamID: reviewData.SanPhamID,
            DonHangID: reviewData.DonHangID,
            SoSao: reviewData.SoSao,
            BinhLuan: reviewData.BinhLuan
          }, {
            onConflict: 'KhachHangID,DonHangID,SanPhamID'
          })

        if (error) throw error
      }
    } catch (err) {
      console.error('Lỗi khi lưu đánh giá vào Supabase:', err.message)
    }

    // Call callback to update parent state
    onSubmit(order.id, item.SanPhamID, { rating, comment })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="glass-effect p-8 rounded-[2.5rem] relative max-w-md w-full shadow-2xl border border-white max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 btn-icon"
        >
          &times;
        </button>
        <h2 className="text-size-2 font-black text-coffee-dark uppercase tracking-tighter mb-2 text-center">Đánh Giá</h2>
        <p className="text-size-1 font-bold text-gray-500 text-center mb-8">
          Món <span className="text-coffee-green font-black">{item.TenSanPham}</span> (Đơn {order.id})
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="text-size-2 hover:scale-115 active:scale-95 transition-transform focus:outline-none"
              >
                <i
                  className={`fa-star ${
                    star <= (hoverRating || rating)
                      ? 'fa-solid text-coffee-yellow drop-shadow-md'
                      : 'fa-regular text-gray-300'
                  }`}
                ></i>
              </button>
            ))}
          </div>
          <div>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cảm nhận của bạn về đồ uống/dịch vụ của chúng tôi..."
              className="w-full py-3 px-4 rounded-2xl bg-white/80 border border-gray-200 text-size-1 font-medium text-gray-700 outline-none resize-none"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-size-1"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Gửi Đánh Giá'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
