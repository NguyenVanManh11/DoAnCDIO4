import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FeaturesView = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'reading', 'acoustic'

  const books = [
    { title: 'Nhà Giả Kim', author: 'Paulo Coelho', category: 'Văn Học', desc: 'Cuốn sách truyền cảm hứng về hành trình theo đuổi ước mơ và lắng nghe trái tim.' },
    { title: 'Tâm Lý Học Tội Phạm', author: 'Stanton E. Samenow', category: 'Tâm Lý', desc: 'Khám phá những góc khuất sâu thẳm trong tâm trí con người qua góc nhìn khoa học.' },
    { title: 'Nghệ Thuật Tư Duy Rành Mạch', author: 'Rolf Dobelli', category: 'Kinh Doanh', desc: '99 lỗi tư duy thường gặp giúp bạn đưa ra những quyết định sáng suốt hơn trong cuộc sống.' },
    { title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro de Vasconcelos', category: 'Tiểu Thuyết', desc: 'Câu chuyện đầy cảm động và yêu thương về cậu bé Zezé thông minh, tinh nghịch.' },
  ]

  const schedule = [
    { day: 'Thứ 6 Hàng Tuần', time: '19:30 - 21:30', band: 'The Dreamers Band', genre: 'Acoustic / Ballad / Indie', note: 'Chủ đề: Những Bản Tình Ca 8x-9x' },
    { day: 'Thứ 7 Hàng Tuần', time: '19:30 - 21:30', band: 'Mộc Acoustic & Friends', genre: 'Pop / R&B / Acoustic', note: 'Chủ đề: Yêu Cầu Bài Hát Theo Thư' },
    { day: 'Chủ Nhật Hàng Tuần', time: '19:00 - 21:00', band: 'Sunset Harmony', genre: 'Acoustic Chill / Jazz', note: 'Chủ đề: Giai Điệu Cuối Tuần & Du Ca' },
  ]

  const handleImageError = (e, fallbackUrl) => {
    e.target.onerror = null
    e.target.src = fallbackUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
  }

  return (
    <main className="p-4 md:p-16 relative flex flex-col items-center text-center animate-fade-in w-full max-w-6xl mx-auto">
      {/* Floating Sparkles */}
      <div className="absolute top-10 left-[5%] text-coffee-yellow text-size-2 opacity-80 animate-pulse">✨</div>
      <div className="absolute bottom-20 right-[5%] text-coffee-yellow text-size-2 opacity-80 animate-pulse">✨</div>

      {/* Hero Header */}
      <div className="glass-effect p-8 md:p-12 rounded-[3rem] shadow-2xl mt-4 w-full border border-white">
        <span className="bg-coffee-green/10 text-coffee-green font-extrabold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest inline-block mb-4">
          Trải Nghiệm Độc Quyền Tại Heritage
        </span>
        <h1 className="text-size-2 md:text-[3.5rem] font-black uppercase text-coffee-green tracking-tighter mb-6 leading-none">
          <span className="block mb-2 text-coffee-dark">GÓC ĐỌC SÁCH &</span>
          <span className="block text-gradient bg-gradient-to-r from-coffee-green via-emerald-700 to-amber-600 bg-clip-text text-transparent">
            LIVE ACOUSTIC
          </span>
        </h1>
        <p className="text-size-1 font-medium text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8 text-justify md:text-center">
          Không chỉ là nơi thưởng thức những tách cà phê tuyệt hảo, Heritage Coffee tạo ra hai không gian đối lập nhưng hoàn hảo: Sự yên tĩnh, sâu lắng của góc tri thức và sự thăng hoa, nồng nhiệt của những đêm nhạc mộc mạc.
        </p>

        {/* Tab Filters */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 uppercase shadow-sm ${
              activeTab === 'all'
                ? 'bg-coffee-green text-white scale-105 shadow-md shadow-coffee-green/20'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
            }`}
          >
            <i className="fa-solid fa-layer-group mr-2"></i> Tất Cả
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 uppercase shadow-sm ${
              activeTab === 'reading'
                ? 'bg-amber-600 text-white scale-105 shadow-md shadow-amber-600/20'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
            }`}
          >
            <i className="fa-solid fa-book-open mr-2"></i> Góc Đọc Sách
          </button>
          <button
            onClick={() => setActiveTab('acoustic')}
            className={`px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 uppercase shadow-sm ${
              activeTab === 'acoustic'
                ? 'bg-rose-600 text-white scale-105 shadow-md shadow-rose-600/20'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
            }`}
          >
            <i className="fa-solid fa-guitar mr-2"></i> Live Acoustic
          </button>
        </div>
      </div>

      {/* SECTION 1: GÓC ĐỌC SÁCH */}
      {(activeTab === 'all' || activeTab === 'reading') && (
        <div className="mt-16 w-full text-left glass-effect p-8 md:p-12 rounded-[3rem] border border-white shadow-xl animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-3 bg-amber-100 text-amber-800 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider">
                <i className="fa-solid fa-book text-lg"></i> Tri Thức & Yên Tĩnh
              </div>
              <h2 className="text-[2.5rem] font-black text-coffee-dark uppercase tracking-tighter leading-tight">
                Góc Đọc Sách <br /> <span className="text-amber-600">Thư Giãn & Tập Trung</span>
              </h2>
              <p className="text-size-1 text-gray-600 font-medium leading-relaxed text-justify">
                Được thiết kế tách biệt với khu vực trò chuyện sôi nổi, Góc Đọc Sách tại Heritage mang lại sự yên tĩnh tuyệt đối cho những ai yêu sách, học tập hay cần sự tập trung cao độ để sáng tạo.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-amber-200/50">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-swatchbook"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">500+ Đầu Sách</h4>
                    <p className="text-xs text-gray-500 mt-1">Đa dạng thể loại từ văn học, tâm lý, kỹ năng đến tiểu thuyết chọn lọc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-amber-200/50">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-lightbulb"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">Ánh Sáng Tiêu Chuẩn</h4>
                    <p className="text-xs text-gray-500 mt-1">Đèn đọc sách riêng biệt cho từng bàn, bảo vệ mắt tối đa.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-amber-200/50">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-couch"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">Sofa 3D Êm Ái</h4>
                    <p className="text-xs text-gray-500 mt-1">Ghế ngồi thiết kế công thái học giúp ngồi đọc hàng giờ không mỏi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-amber-200/50">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-gift"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">Đọc Sách Miễn Phí</h4>
                    <p className="text-xs text-gray-500 mt-1">Hoàn toàn miễn phí mượn và đọc tại quán cho tất cả khách hàng.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5 h-full min-h-[350px]">
              <div className="h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80"
                  alt="Reading Corner"
                  onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Góc Chill & Học Tập</span>
                  <p className="text-lg font-black mt-1">Một góc nhỏ an yên giữa lòng thành phố</p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Books Box */}
          <div className="mt-12 pt-10 border-t border-gray-200/60">
            <h3 className="text-lg font-black text-coffee-dark uppercase tracking-wide mb-6 flex items-center gap-2">
              <i className="fa-solid fa-bookmark text-amber-500"></i> Một Số Đầu Sách Nổi Bật Tại Quán
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {books.map((b, i) => (
                <div key={i} className="bg-white/90 p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase">
                    {b.category}
                  </span>
                  <h4 className="font-bold text-coffee-dark mt-3 text-base line-clamp-1">{b.title}</h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Tác giả: {b.author}</p>
                  <p className="text-xs text-gray-600 mt-3 line-clamp-3 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LIVE ACOUSTIC */}
      {(activeTab === 'all' || activeTab === 'acoustic') && (
        <div className="mt-16 w-full text-left glass-effect p-8 md:p-12 rounded-[3rem] border border-white shadow-xl animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5 h-full min-h-[350px] order-2 lg:order-1">
              <div className="h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                  alt="Live Acoustic Night"
                  onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-rose-400 font-bold text-xs uppercase tracking-widest">Đêm Nhạc Cuối Tuần</span>
                  <p className="text-lg font-black mt-1">Âm nhạc chạm đến từng nhịp cảm xúc</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-3 bg-rose-100 text-rose-800 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider">
                <i className="fa-solid fa-microphone-lines text-lg"></i> Âm Nhạc & Cảm Xúc
              </div>
              <h2 className="text-[2.5rem] font-black text-coffee-dark uppercase tracking-tighter leading-tight">
                Live Acoustic <br /> <span className="text-rose-600">Giai Điệu Mộc Mạc</span>
              </h2>
              <p className="text-size-1 text-gray-600 font-medium leading-relaxed text-justify">
                Khi màn đêm buông xuống vào mỗi dịp cuối tuần, Heritage chuyển mình thành sân khấu âm nhạc ấm cúng. Nơi bạn có thể thả lỏng tâm hồn, lắng nghe những giọng ca Indie truyền cảm và gửi gắm câu chuyện qua các bài hát yêu cầu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-rose-200/50">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">T6 - T7 - CN Hàng Tuần</h4>
                    <p className="text-xs text-gray-500 mt-1">Khung giờ vàng từ 19:30 đến 21:30 với các ban nhạc khác nhau.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-rose-200/50">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-ticket"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">Không Phụ Thu Phí</h4>
                    <p className="text-xs text-gray-500 mt-1">Khách hàng chỉ cần gọi đồ uống trong menu, không tính thêm phụ thu đêm nhạc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-rose-200/50">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-compact-disc"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">Yêu Cầu Bài Hát</h4>
                    <p className="text-xs text-gray-500 mt-1">Viết lời nhắn và bài hát yêu cầu lên giấy, ban nhạc sẽ thể hiện tặng bạn.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl border border-rose-200/50">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark text-sm uppercase">Giao Lưu Trực Tiếp</h4>
                    <p className="text-xs text-gray-500 mt-1">Khán giả có thể đăng ký biểu diễn tự do trong 30 phút cuối chương trình.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="mt-12 pt-10 border-t border-gray-200/60">
            <h3 className="text-lg font-black text-coffee-dark uppercase tracking-wide mb-6 flex items-center gap-2">
              <i className="fa-solid fa-clock text-rose-500"></i> Lịch Biểu Diễn Tuần Này
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schedule.map((s, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white via-white to-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-rose-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <span className="bg-rose-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase inline-block shadow-sm">
                    {s.day}
                  </span>
                  <h4 className="font-black text-coffee-dark text-xl mt-4">{s.band}</h4>
                  <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1.5">
                    <i className="fa-solid fa-clock"></i> {s.time}
                  </p>
                  <p className="text-sm text-gray-600 font-medium mt-3 bg-white/80 p-3 rounded-xl border border-rose-50">
                    {s.note}
                  </p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Thể loại:</span>
                    <span className="font-bold text-coffee-dark">{s.genre}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: OTHER AMENITIES (WIFI & GARDEN) */}
      <div className="mt-16 w-full text-left">
        <h2 className="text-size-2 font-black text-coffee-dark uppercase mb-8 text-center tracking-tighter">
          Các Tiện Ích Đi Kèm Khác
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-effect p-8 rounded-[2.5rem] border border-white flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                <i className="fa-solid fa-tree"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-coffee-dark uppercase">Sân Vườn Xanh & Hồ Cá Koi</h3>
                <p className="text-xs font-bold text-emerald-600">Không Gian Thiên Nhiên Mở</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed text-justify mb-6">
              Khu vườn nhiệt đới được bố trí hài hòa với hệ thống cây xanh dịu mát, hồ cá Koi sinh động cùng hệ thống phun sương tự động, mang đến bầu không khí trong lành, xua tan cái nóng bức của Sài Gòn.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-emerald-50 text-emerald-800 font-bold text-[11px] px-3 py-1 rounded-full"><i className="fa-solid fa-check mr-1"></i> Bàn ngoài trời thoáng đãng</span>
              <span className="bg-emerald-50 text-emerald-800 font-bold text-[11px] px-3 py-1 rounded-full"><i className="fa-solid fa-check mr-1"></i> Hồ cá Koi check-in</span>
            </div>
          </div>

          <div className="glass-effect p-8 rounded-[2.5rem] border border-white flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                <i className="fa-solid fa-wifi"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-coffee-dark uppercase">Wifi Tốc Độ Cao 500Mbps</h3>
                <p className="text-xs font-bold text-blue-600">Ổ Cắm Điện Dưới Từng Bàn</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed text-justify mb-6">
              Trang bị đường truyền cáp quang tốc độ cao chuyên dụng, đảm bảo kết nối mượt mà cho cuộc gọi video, họp trực tuyến hay tải tài liệu nặng. Bố trí ổ cắm điện đầy đủ tại 100% vị trí bàn ngồi.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-blue-50 text-blue-800 font-bold text-[11px] px-3 py-1 rounded-full"><i className="fa-solid fa-bolt mr-1"></i> Sạc laptop & điện thoại</span>
              <span className="bg-blue-50 text-blue-800 font-bold text-[11px] px-3 py-1 rounded-full"><i className="fa-solid fa-network-wired mr-1"></i> Không giới hạn băng thông</span>
            </div>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="mt-16 w-full glass-effect bg-gradient-to-r from-coffee-dark to-emerald-950 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-coffee-green/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-coffee-yellow leading-tight">
            Bạn Đã Sẵn Sàng Trải Nghiệm Heritage?
          </h2>
          <p className="text-sm md:text-base text-gray-300 font-medium leading-relaxed">
            Hãy chọn cho mình một góc ngồi ưng ý nhất, dù là để đọc một cuốn sách hay thăng hoa cùng những giai điệu acoustic đêm nay!
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-2">
            <button
              onClick={() => navigate('/booking')}
              className="btn-accent px-8 py-3.5 text-sm font-black tracking-widest uppercase shadow-lg hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-chair mr-2"></i> Đặt Bàn Ngay
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="bg-white text-coffee-green hover:bg-coffee-yellow hover:text-coffee-dark border-2 border-white px-8 py-3.5 rounded-full text-sm font-black tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <i className="fa-solid fa-mug-hot mr-2"></i> Xem Thực Đơn
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FeaturesView
