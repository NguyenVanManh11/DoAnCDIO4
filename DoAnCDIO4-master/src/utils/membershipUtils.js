// Membership logic & calculation utilities for Heritage Coffee & Tea

export const MEMBERSHIP_TIERS = [
  { id: 1, name: 'Thường', minPoints: 0, maxPoints: 100, discount: 0, color: 'text-gray-600 bg-gray-100 border-gray-300', icon: 'fa-user' },
  { id: 2, name: 'Đồng', minPoints: 100, maxPoints: 300, discount: 3, color: 'text-amber-800 bg-amber-100 border-amber-300', icon: 'fa-medal' },
  { id: 3, name: 'Bạc', minPoints: 300, maxPoints: 500, discount: 5, color: 'text-slate-700 bg-slate-200 border-slate-400', icon: 'fa-award' },
  { id: 4, name: 'Vàng', minPoints: 500, maxPoints: 700, discount: 8, color: 'text-amber-600 bg-amber-50 border-amber-400', icon: 'fa-crown' },
  { id: 5, name: 'Bạch Kim', minPoints: 700, maxPoints: 1000, discount: 10, color: 'text-indigo-700 bg-indigo-50 border-indigo-300', icon: 'fa-gem' },
  { id: 6, name: 'Kim Cương', minPoints: 1001, maxPoints: Infinity, discount: 15, color: 'text-cyan-600 bg-cyan-50 border-cyan-400', icon: 'fa-diamond' }
]

export const getMembershipRank = (points = 0) => {
  const p = parseInt(points) || 0
  if (p > 1000) return MEMBERSHIP_TIERS[5] // Kim Cương
  if (p >= 700) return MEMBERSHIP_TIERS[4] // Bạch Kim
  if (p >= 500) return MEMBERSHIP_TIERS[3] // Vàng
  if (p >= 300) return MEMBERSHIP_TIERS[2] // Bạc
  if (p >= 100) return MEMBERSHIP_TIERS[1] // Đồng
  return MEMBERSHIP_TIERS[0] // Thường
}

export const getNextTierInfo = (points = 0) => {
  const p = parseInt(points) || 0
  const currentTier = getMembershipRank(p)
  
  if (currentTier.id === 6) {
    return {
      nextTier: null,
      pointsNeeded: 0,
      progressPercent: 100,
      message: 'Bạn đã đạt hạng tối đa!'
    }
  }
  
  const nextTier = MEMBERSHIP_TIERS.find(t => t.id === currentTier.id + 1) || MEMBERSHIP_TIERS[5]
  const pointsNeeded = nextTier.minPoints - p
  const range = nextTier.minPoints - currentTier.minPoints
  const currentProgress = p - currentTier.minPoints
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)))
  
  return {
    nextTier,
    pointsNeeded,
    progressPercent,
    message: `Cần thêm ${pointsNeeded.toLocaleString()} điểm để lên hạng ${nextTier.name} (-${nextTier.discount}%)`
  }
}

export const calculateOrderPoints = (amountVND = 0) => {
  const amount = parseFloat(amountVND) || 0
  return Math.floor(amount / 1000)
}
