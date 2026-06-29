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

  return (
    <main className="p-4 md:p-16 relative flex flex-col items-center text-center animate-fade-in w-full max-w-6xl mx-auto">
      <div className="absolute top-10 left-[10%] text-coffee-yellow text-size-2 opacity-80 animate-pulse">✨</div>
      <div className="absolute bottom-20 right-[10%] text-coffee-yellow text-size-2 opacity-80 animate-pulse">✨</div>

      <div className="glass-effect p-8 md:p-12 rounded-[3rem] shadow-2xl mt-8 w-full border border-white">
        <h1 className="text-size-2 md:text-[4rem] font-black uppercase text-coffee-green tracking-tighter mb-6 leading-none">
          A JOURNEY<br />THROUGH HISTORY
        </h1>
        <p className="text-size-1 font-medium text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8 text-justify md:text-center">
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
        <h2 className="text-size-2 font-black text-coffee-dark uppercase mb-8 text-center tracking-tighter">
          Không Gian Của Chúng Tôi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="glass-effect p-6 rounded-[2rem] text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 group border border-white"
            >
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-size-2 text-coffee-green group-hover:bg-coffee-green group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                <i className={`fa-solid ${f.i}`}></i>
              </div>
              <h3 className="text-size-1 font-black text-coffee-dark uppercase">{f.t}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default HomeView
