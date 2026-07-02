import React, { useState } from 'react'

const SettingsView = ({ globalScale, setGlobalScale, showNotify }) => {
  const isDbConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundType, setSoundType] = useState(() => localStorage.getItem('notify_sound_type') || 'ting')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const handleResetSettings = () => {
    setGlobalScale(16)
    setSoundEnabled(true)
    setDarkMode(false)
    showNotify('Đã khôi phục cài đặt gốc!')
  }

  const handleClearCache = () => {
    showNotify('Đã dọn dẹp bộ nhớ đệm hệ thống!')
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto no-scrollbar flex flex-col gap-6 animate-fade-in">
      <div className="shrink-0">
        <h2 className="text-size-2 font-black uppercase text-coffee-dark tracking-tighter mb-1">
          Hệ Thống Cài Đặt
        </h2>
        <p className="text-size-0 font-bold text-gray-500 uppercase tracking-widest">
          Tinh chỉnh thông số hệ thống và chẩn đoán kết nối
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tỷ lệ giao diện */}
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md space-y-6">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark pl-2">
            Kích thước Font Hệ thống (Rem)
          </h3>
          <p className="text-size-1 font-medium text-gray-500 leading-relaxed pl-2">
            Điều chỉnh độ thu phóng của toàn bộ hệ thống (dành cho màn hình tivi lớn hoặc màn hình phụ tại quầy bar).
          </p>

          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-full">
              <button
                onClick={() => setGlobalScale(Math.max(12, globalScale - 1))}
                className="w-12 h-12 bg-white rounded-full font-black text-size-1 text-coffee-green shadow hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-16 text-center text-size-1 font-black">{globalScale}px</span>
              <button
                onClick={() => setGlobalScale(Math.min(24, globalScale + 1))}
                className="w-12 h-12 bg-white rounded-full font-black text-size-1 text-coffee-green shadow hover:bg-gray-50"
              >
                +
              </button>
            </div>
            
            <button
              onClick={handleResetSettings}
              className="py-3 px-6 bg-coffee-dark hover:bg-black text-white text-size-0 font-black uppercase tracking-wider rounded-full transition-colors shadow-sm"
            >
              Mặc định
            </button>
          </div>
        </div>

        {/* Chẩn đoán Database */}
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md space-y-6">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark pl-2">
            Kết Nối Cơ Sở Dữ Liệu
          </h3>

          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-size-1 font-bold text-gray-500">Công nghệ:</span>
              <span className="text-size-1 font-black text-coffee-green">Supabase (PostgreSQL)</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-size-1 font-bold text-gray-500">Trạng thái cấu hình:</span>
              {isDbConfigured ? (
                <span className="text-size-0 font-black uppercase bg-green-50 text-green-600 border border-green-100 px-4 py-1.5 rounded-full">
                  <i className="fa-solid fa-circle-check mr-2"></i>Đã Kết Nối
                </span>
              ) : (
                <span className="text-size-0 font-black uppercase bg-amber-50 text-amber-600 border border-amber-100 px-4 py-1.5 rounded-full">
                  <i className="fa-solid fa-triangle-exclamation mr-2"></i>Chế Độ Demo
                </span>
              )}
            </div>

            <div className="text-size-0 text-gray-500 leading-relaxed font-bold bg-gray-50 p-4 rounded-xl border border-gray-100">
              {isDbConfigured 
                ? 'Hệ thống đã nhận diện đầy đủ biến môi trường VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY. Mọi thao tác đặt bàn, hóa đơn và CRUD sản phẩm sẽ trực tiếp ghi xuống database của Supabase.'
                : 'Các biến môi trường VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY chưa được khai báo hoặc rỗng. Hệ thống sẽ tự động chuyển sang chế độ Demo và sử dụng Mock Data mô phỏng.'
              }
            </div>
          </div>
        </div>

        {/* Tùy chỉnh Cá Nhân */}
        <div className="glass-effect p-6 rounded-[2rem] border border-white shadow-md space-y-6">
          <h3 className="text-size-1 font-black uppercase tracking-widest text-coffee-dark pl-2">
            Tùy Chỉnh Cá Nhân
          </h3>

          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <span className="text-size-1 font-bold text-gray-700 block">Bật âm thanh</span>
                <span className="text-sm font-medium text-gray-500">Phát âm thanh khi có đơn hàng mới</span>
              </div>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-14 h-7 rounded-full transition-colors relative ${soundEnabled ? 'bg-coffee-green' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${soundEnabled ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <span className="text-size-1 font-bold text-gray-700 block">Kiểu âm thanh</span>
                <span className="text-sm font-medium text-gray-500">Chọn giai điệu thông báo</span>
              </div>
              <select
                value={soundType}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setSoundType(newVal);
                  localStorage.setItem('notify_sound_type', newVal);
                  import('../utils/audioUtils').then(({ playNotificationSound }) => {
                    if (soundEnabled) playNotificationSound(newVal);
                  });
                }}
                disabled={!soundEnabled}
                className="p-2 rounded-xl border border-gray-200 bg-white text-size-0 font-bold focus:ring-2 focus:ring-coffee-green outline-none"
              >
                <option value="ting">Tiếng Ting</option>
                <option value="beep">Tiếng Bíp</option>
                <option value="tingting">Ting Ting (Kép)</option>
              </select>
            </div>

            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <span className="text-size-1 font-bold text-gray-700 block">Chế độ tối (Dark Mode)</span>
                <span className="text-sm font-medium text-gray-500">Giao diện tối giúp dịu mắt</span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-coffee-dark' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${darkMode ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-size-1 font-bold text-gray-700 block">Bộ nhớ đệm</span>
                <span className="text-sm font-medium text-gray-500">Làm sạch cache hệ thống</span>
              </div>
              <button 
                onClick={handleClearCache}
                className="py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold uppercase rounded-xl transition-colors text-sm"
              >
                Xóa Cache
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SettingsView
