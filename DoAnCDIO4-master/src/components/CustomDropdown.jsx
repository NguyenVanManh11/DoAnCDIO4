import React, { useState, useRef, useEffect } from 'react'

const CustomDropdown = ({
  options = [], // Array of { value: any, label: string, icon?: string, color?: string }
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => String(opt.value) === String(value))

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white border-2 border-gray-200/80 hover:border-coffee-green/60 text-size-1 font-bold text-coffee-dark shadow-sm transition-all duration-200 outline-none active:scale-[0.99] ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'border-coffee-green ring-2 ring-coffee-green/20 shadow-md' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          {selectedOption?.icon && (
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${selectedOption.color || 'bg-coffee-green/10 text-coffee-green'}`}>
              <i className={`fa-solid ${selectedOption.icon} text-xs`}></i>
            </div>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <i className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-coffee-green' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full min-w-[200px] rounded-[1.5rem] bg-white/95 backdrop-blur-xl shadow-2xl border-2 border-white/80 p-2 animate-fade-in max-h-60 overflow-y-auto no-scrollbar ring-1 ring-black/5">
          <div className="space-y-1">
            {options.map((option, idx) => {
              const isSelected = String(option.value) === String(value)
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-size-1 flex items-center justify-between gap-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-coffee-green to-emerald-800 text-white shadow-md shadow-coffee-green/20'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-coffee-green hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {option.icon && (
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        isSelected ? 'bg-white/20 text-coffee-yellow' : option.color || 'bg-gray-100 text-coffee-green'
                      }`}>
                        <i className={`fa-solid ${option.icon}`}></i>
                      </div>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && (
                    <i className="fa-solid fa-check text-xs text-coffee-yellow shrink-0"></i>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
