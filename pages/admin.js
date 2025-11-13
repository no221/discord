// pages/admin.js
import { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

export default function Admin() {
  const [authorized, setAuthorized] = useState(false)
  const [pwd, setPwd] = useState('')
  const [data, setData] = useState({ purchases: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const purchases = Array.isArray(data?.purchases) ? data.purchases : []

  useEffect(() => {
    if (authorized) {
      fetchData()
    }
  }, [authorized])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/purchase')
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      setData(json || { purchases: [] })
    } catch (err) {
      setError(`Failed to load data: ${err.message}`)
      setData({ purchases: [] })
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    if (!pwd.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd.trim() })
      })

      const result = await res.json()
      if (result.success) {
        setAuthorized(true)
        setError('')
      } else {
        setError('Wrong password')
        setPwd('')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && pwd.trim()) {
      handleLogin()
    }
  }

  // Format datetime function
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: 'N/A', time: 'N/A', full: 'N/A' }
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      full: date.toLocaleString('id-ID')
    }
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl text-white font-bold">⚙️</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Admin Access</h2>
            <p className="text-gray-400 mt-2">Enter password to continue</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400"
              disabled={loading}
            />

            <button
              className="w-full px-4 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:bg-gray-600 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={handleLogin}
              disabled={!pwd.trim() || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                '🔐 Login to Dashboard'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
            >
              ← Back to Main Store
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white">🎯 Admin Dashboard</h1>
          </header>

          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Purchase Data Yet</h2>
            <p className="text-gray-400 mb-6">
              The purchases table is empty. Make a test purchase from the store or add data manually in Supabase.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <a
                href="/"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🏪 Go to Store
              </a>
              <a
                href={`https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/editor`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📊 Open Supabase
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==================== Stats Calculations ====================
  const totalBought = purchases.reduce((sum, purchase) => sum + (Number(purchase?.qty) || 0), 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyBuy = purchases
    .filter(purchase => {
      if (!purchase?.created_at) return false
      const purchaseDate = new Date(purchase.created_at)
      return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear
    })
    .reduce((sum, purchase) => sum + (Number(purchase?.qty) || 0), 0)

  const countByProduct = {}
  purchases.forEach((purchase) => {
    const productName = purchase?.product_name || purchase?.productId || 'Unknown Product'
    const quantity = Number(purchase?.qty) || 0
    countByProduct[productName] = (countByProduct[productName] || 0) + quantity
  })

  const mostBoughtEntries = Object.entries(countByProduct)
  const mostBought = mostBoughtEntries.length > 0
    ? mostBoughtEntries.sort((a, b) => b[1] - a[1])[0]
    : ['No data', 0]

  // Voucher-specific calculations
  const purchasesWithVoucher = purchases.filter(p => p.voucher_code)
  const uniqueVouchersUsed = [...new Set(purchases.map(p => p.voucher_code).filter(Boolean))]
  
  const voucherUsageCount = {}
  purchases.forEach(purchase => {
    if (purchase.voucher_code) {
      voucherUsageCount[purchase.voucher_code] = (voucherUsageCount[purchase.voucher_code] || 0) + 1
    }
  })
  
  const mostUsedVoucher = Object.entries(voucherUsageCount).length > 0
    ? Object.entries(voucherUsageCount).sort((a, b) => b[1] - a[1])[0]
    : ['No voucher used', 0]

  // Revenue calculations with voucher discounts
  const totalOriginalRevenue = purchases.reduce((sum, purchase) => 
    sum + (Number(purchase?.price) || 0) * (Number(purchase?.qty) || 0), 0
  )
  
  const totalFinalRevenue = purchases.reduce((sum, purchase) => 
    sum + (Number(purchase?.final_price) || (Number(purchase?.price) || 0) * (Number(purchase?.qty) || 0)), 0
  )
  
  const totalDiscountGiven = totalOriginalRevenue - totalFinalRevenue
  const averageDiscountRate = purchasesWithVoucher.length > 0 
    ? purchasesWithVoucher.reduce((sum, p) => sum + (Number(p.discount_rate) || 0), 0) / purchasesWithVoucher.length
    : 0

  const uniqueCustomers = [...new Set(purchases.map(p => p?.phone).filter(Boolean))].length

  // Monthly revenue data for chart
  const monthlyRevenue = {}
  purchases.forEach(purchase => {
    if (!purchase?.created_at) return
    const date = new Date(purchase.created_at)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const revenue = Number(purchase.final_price) || (Number(purchase.price) || 0) * (Number(purchase.qty) || 0)
    monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + revenue
  })

  const monthlyRevenueData = {
    labels: Object.keys(monthlyRevenue).sort(),
    datasets: [{
      label: 'Monthly Revenue (Rp)',
      data: Object.keys(monthlyRevenue).sort().map(key => monthlyRevenue[key]),
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
    }],
  }

  const pieData = {
    labels: Object.keys(countByProduct).length > 0 ? Object.keys(countByProduct) : ['No Data'],
    datasets: [{
      data: Object.values(countByProduct).length > 0 ? Object.values(countByProduct) : [1],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8C9EFF', '#80CBC4'
      ],
      borderWidth: 1,
    }],
  }

  const voucherPieData = {
    labels: uniqueVouchersUsed.length > 0 ? uniqueVouchersUsed : ['No Vouchers'],
    datasets: [{
      data: uniqueVouchersUsed.length > 0 ? uniqueVouchersUsed.map(voucher => voucherUsageCount[voucher]) : [1],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8C9EFF', '#80CBC4'
      ],
      borderWidth: 1,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12
          }
        }
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb'
        }
      },
      title: {
        display: true,
        color: '#e5e7eb'
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return 'Rp ' + value.toLocaleString();
          }
        },
        grid: {
          color: '#374151'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: '#374151'
        }
      }
    }
  }

  // ==================== Render Dashboard ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-white flex items-center">🎯 Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your store analytics and purchases</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={fetchData} 
                disabled={loading} 
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 disabled:bg-gray-600 transition-all duration-200 font-medium flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? '🔄 Loading...' : '📊 Refresh Data'}
              </button>
              <button 
                onClick={() => { setAuthorized(false); setPwd(''); setError('') }} 
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚪 Logout
              </button>
              <a 
                href="/" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🏪 Store Front
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-1 bg-gray-700/50 rounded-lg p-1">
            {['overview', 'analytics', 'customers', 'products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'analytics' && '📈 Analytics'}
                {tab === 'customers' && '👥 Customers'}
                {tab === 'products' && '🎯 Products'}
              </button>
            ))}
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading purchase data...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Monthly Sales</p>
                        <p className="text-3xl font-bold text-white mt-2">{monthlyBuy}</p>
                        <p className="text-xs text-blue-200 mt-1">items this month</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">📈</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Total Items Sold</p>
                        <p className="text-3xl font-bold text-white mt-2">{totalBought}</p>
                        <p className="text-xs text-green-200 mt-1">all time</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">🛒</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-white mt-2">
                          Rp {totalFinalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-purple-200 mt-1">after discounts</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">💰</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Voucher Usage</p>
                        <p className="text-3xl font-bold text-white mt-2">{purchasesWithVoucher.length}</p>
                        <p className="text-xs text-orange-200 mt-1">
                          {mostUsedVoucher[0]} ({mostUsedVoucher[1]}x)
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">🎫</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100 text-sm font-medium">Latest Order</p>
                        <p className="text-lg font-bold text-white mt-2">
                          {purchases.length > 0 ? (
                            <>
                              {formatDateTime(purchases[0].created_at).date}
                              <br />
                              <span className="text-sm text-cyan-200">
                                {formatDateTime(purchases[0].created_at).time}
                              </span>
                            </>
                          ) : 'No orders'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">🕒</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voucher Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Total Discount</p>
                        <p className="text-2xl font-bold text-white mt-2">
                          Rp {totalDiscountGiven.toLocaleString()}
                        </p>
                        <p className="text-xs text-red-200 mt-1">given via vouchers</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">💸</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">Unique Vouchers</p>
                        <p className="text-3xl font-bold text-white mt-2">{uniqueVouchersUsed.length}</p>
                        <p className="text-xs text-indigo-200 mt-1">different codes used</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">🏷️</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm font-medium">Avg Discount</p>
                        <p className="text-2xl font-bold text-white mt-2">
                          {Math.round(averageDiscountRate * 100)}%
                        </p>
                        <p className="text-xs text-teal-200 mt-1">per voucher order</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">📊</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm font-medium">Voucher Rate</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {Math.round((purchasesWithVoucher.length / purchases.length) * 100)}%
                        </p>
                        <p className="text-xs text-pink-200 mt-1">of orders use voucher</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl text-white">🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Product Distribution Chart */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    📊 Product Distribution
                  </h3>
                  <div className="w-full max-w-md mx-auto">
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                </div>

                {/* Voucher Usage Chart */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    🎫 Voucher Usage
                  </h3>
                  <div className="w-full max-w-md mx-auto">
                    <Pie data={voucherPieData} options={chartOptions} />
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 lg:col-span-2">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    💰 Monthly Revenue Trend
                  </h3>
                  <div className="w-full max-w-4xl mx-auto">
                    <Bar data={monthlyRevenueData} options={barChartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Purchase History Table dengan Jam & Waktu */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    📋 Purchase History (Latest First)
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className="text-gray-400 text-sm">
                      Total: {purchases.length} orders
                    </span>
                    <span className="text-gray-400 text-sm">
                      • With voucher: {purchasesWithVoucher.length}
                    </span>
                  </div>
                </div>
              </div>
              
              {purchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Date & Time</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Product</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Size</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Qty</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Original</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Final</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Voucher</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Discount</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Payment</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Customer</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {purchases.map((purchase, index) => {
                        const originalTotal = (Number(purchase.price) || 0) * (Number(purchase.qty) || 0)
                        const finalTotal = Number(purchase.final_price) || originalTotal
                        const discount = originalTotal - finalTotal
                        const discountRate = purchase.discount_rate ? Math.round(purchase.discount_rate * 100) : 0
                        
                        const datetime = formatDateTime(purchase.created_at)
                        
                        return (
                          <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                            {/* Kolom Date & Time */}
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-white">
                                {datetime.date}
                              </div>
                              <div className="text-xs text-gray-400">
                                {datetime.time}
                              </div>
                            </td>
                            
                            <td className="py-3 px-4 text-sm text-gray-200">
                              {purchase.product_name || purchase.productId || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">{purchase.size || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-400 text-center">{purchase.qty || 0}</td>
                            <td className="py-3 px-4 text-sm text-gray-500 line-through">
                              Rp {originalTotal.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-green-400">
                              Rp {finalTotal.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {purchase.voucher_code ? (
                                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-medium border border-yellow-500/30">
                                  {purchase.voucher_code}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {discount > 0 ? (
                                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                                  -Rp {discount.toLocaleString()} ({discountRate}%)
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">0%</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {purchase.payment_method ? (
                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium border border-blue-500/30 capitalize">
                                  {purchase.payment_method}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-300">{purchase.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-400 font-mono">
                              {purchase.phone || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400 max-w-xs">
                              {purchase.notes ? (
                                <details className="cursor-pointer">
                                  <summary className="text-orange-400 hover:text-orange-300 text-xs transition-colors">
                                    View Notes
                                  </summary>
                                  <div className="mt-2 p-2 bg-gray-700 rounded text-xs break-words border border-gray-600">
                                    {purchase.notes}
                                  </div>
                                </details>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-500">📭</span>
                  </div>
                  <p className="text-gray-400 text-lg">No purchase data available</p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-xl font-bold">Rp {totalFinalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <p className="text-xl font-bold">{purchases.length}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Discount Given</p>
                  <p className="text-xl font-bold">Rp {totalDiscountGiven.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Voucher Orders</p>
                  <p className="text-xl font-bold">
                    {purchasesWithVoucher.length} ({Math.round((purchasesWithVoucher.length / purchases.length) * 100)}%)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}