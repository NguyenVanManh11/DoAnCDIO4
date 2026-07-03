import React from 'react'
import { useNavigate } from 'react-router-dom'

const HomeView = () => {
  const navigate = useNavigate()

  const features = [
    { t: 'Wifi Tốc Độ Cao', i: 'fa-wifi' },
    { t: 'Sân Vườn Xanh', i: 'fa-tree' },
    { t: 'Góc Đọc Sách', i: 'fa-book-open' },
    { t: 'Live Acoustic', i: 'fa-guitar' },
  ]

  const handleImageError = (e, fallbackUrl) => {
    e.target.onerror = null
    e.target.src = fallbackUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
  }

  return (
    <main className="p-4 md:p-16 relative flex flex-col items-center text-center animate-fade-in w-full max-w-6xl mx-auto">
      <div className="absolute top-10 left-[10%] text-coffee-yellow text-size-2 opacity-80 animate-pulse">✨</div>
      <div className="absolute bottom-20 right-[10%] text-coffee-yellow text-size-2 opacity-80 animate-pulse">✨</div>

      <div className="glass-effect p-8 md:p-12 rounded-[3rem] shadow-2xl mt-8 w-full border border-white dark:border-slate-800">
        <h1 className="text-size-2 md:text-[4rem] font-black uppercase text-coffee-green tracking-tighter mb-6 leading-none">
          <span className="block mb-2 md:mb-4">A JOURNEY</span>
          <span className="block">THROUGH HISTORY</span>
        </h1>
        <p className="text-size-1 font-medium text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 text-justify md:text-center">
          Khởi nguồn của cà phê bắt đầu từ nhiều thế kỷ trước tại cao nguyên Ethiopia. Kể từ đó, cà phê đã vượt qua các đại dương và đế chế, trở thành thức uống được yêu thích trên toàn thế giới. Quán cà phê trở thành trung tâm giao lưu văn hóa, ảnh hưởng đến những cuộc trò chuyện, chính trị và nghệ thuật.
        </p>
        <div className="flex gap-4 flex-wrap justify-center mt-2">
          <button
            onClick={() => navigate('/menu')}
            className="btn-accent px-8 py-3.5 text-size-1 tracking-widest"
          >
            <i className="fa-solid fa-mug-hot"></i> Xem Thực Đơn
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="btn-secondary px-8 py-3.5 text-size-1 tracking-widest"
          >
            <i className="fa-solid fa-chair"></i> Đặt Bàn Ngay
          </button>
        </div>
      </div>

      <div className="mt-16 w-full text-left">
        <h2 className="text-size-2 font-black text-coffee-dark dark:text-emerald-400 uppercase mb-8 text-center tracking-tighter">
          Không Gian Của Chúng Tôi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((f, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/features')}
              className="glass-effect p-6 rounded-[2rem] text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 group border border-white dark:border-slate-800 cursor-pointer relative"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-size-2 text-coffee-green dark:text-emerald-400 group-hover:bg-coffee-green dark:group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                <i className={`fa-solid ${f.i}`}></i>
              </div>
              <h3 className="text-size-1 font-black text-coffee-dark dark:text-gray-100 uppercase">{f.t}</h3>
              <p className="text-xs text-coffee-green font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                Khám phá chi tiết <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </p>
            </div>
          ))}
        </div>

        {/* Image Gallery & Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 glass-effect p-8 md:p-12 rounded-[3rem] border border-white dark:border-slate-800">
          <div className="space-y-6">
            <h2 className="text-[2.5rem] font-black text-coffee-green uppercase tracking-tighter leading-tight">
              Nơi Lưu Giữ <br /> Từng Khoảnh Khắc
            </h2>
            <p className="text-size-1 text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Với thiết kế hòa quyện giữa nét hoài cổ và không gian mở hiện đại, Heritage Coffee mang đến một trải nghiệm thưởng thức cà phê độc đáo. Từng góc nhỏ tại quán đều được chăm chút tỉ mỉ, từ ánh đèn vàng ấm áp đến những mảng xanh dịu mát của cây cỏ.
            </p>
            <p className="text-size-1 text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Dù bạn cần một góc yên tĩnh để làm việc, một không gian lãng mạn cho buổi hẹn hò, hay góc sống ảo cực chất cùng bạn bè, Heritage luôn sẵn sàng chào đón bạn.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="btn-primary px-8 py-3.5 text-size-1 tracking-widest mt-4 inline-flex items-center gap-2"
            >
              Trải Nghiệm Ngay <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <div className="space-y-4 h-full">
              <div className="h-[60%] rounded-3xl overflow-hidden shadow-lg group">
                <img 
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80" 
                  alt="Cafe interior" 
                  onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="h-[35%] rounded-3xl overflow-hidden shadow-lg group">
                <img 
                  src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80" 
                  alt="Coffee brewing" 
                  onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
            </div>
            <div className="space-y-4 h-full pt-8">
              <div className="h-[45%] rounded-3xl overflow-hidden shadow-lg group">
                <img 
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80" 
                  alt="Coffee shop" 
                  onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="h-[50%] rounded-3xl overflow-hidden shadow-lg group relative">
                <img 
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80" 
                  alt="Coffee art" 
                  onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomeView
