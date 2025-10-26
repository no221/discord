// pages/admin.js
import { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Admin() {
  const [authorized, setAuthorized] = useState(false)
  const [pwd, setPwd] = useState('')
  const [data, setData] = useState({ purchases: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white font-bold">⚙️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Admin Access</h2>
            <p className="text-gray-600 mt-2">Enter password to continue</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />

            <button
              className="w-full px-4 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg"
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
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">🎯 Admin Dashboard</h1>
          </header>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Purchase Data Yet</h2>
            <p className="text-gray-600 mb-6">
              The purchases table is empty. Make a test purchase from the store or add data manually in Supabase.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <a
                href="/"
                className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                🏪 Go to Store
              </a>
              <a
                href={`https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/editor`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
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

  const pieData = {
    labels: Object.keys(countByProduct).length > 0 ? Object.keys(countByProduct) : ['No Data'],
    datasets: [{
      data: Object.values(countByProduct).length > 0 ? Object.values(countByProduct) : [1],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
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
      legend: { position: 'bottom' },
    },
  }

  // ==================== Render Dashboard ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">🎯 Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your store analytics and purchases</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={fetchData} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all duration-200 font-medium flex items-center shadow-md hover:shadow-lg">
                {loading ? '🔄 Loading...' : '📊 Refresh Data'}
              </button>
              <button onClick={() => { setAuthorized(false); setPwd(''); setError('') }} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center shadow-md hover:shadow-lg">
                🚪 Logout
              </button>
              <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center shadow-md hover:shadow-lg">
                🏪 Store Front
              </a>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-md">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading purchase data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Monthly Sales</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{monthlyBuy}</p>
                    <p className="text-xs text-gray-500 mt-1">items this month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-blue-500">📈</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Items Sold</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalBought}</p>
                    <p className="text-xs text-gray-500 mt-1">all time</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-green-500">🛒</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      Rp {totalFinalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">after discounts</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-purple-500">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Voucher Usage</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{purchasesWithVoucher.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {mostUsedVoucher[0]} ({mostUsedVoucher[1]}x)
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-orange-500">🎫</span>
                  </div>
                </div>
              </div>

              {/* Latest Order Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Latest Order</p>
                    <p className="text-lg font-bold text-gray-800 mt-2">
                      {purchases.length > 0 ? (
                        <>
                          {formatDateTime(purchases[0].created_at).date}
                          <br />
                          <span className="text-sm text-gray-500">
                            {formatDateTime(purchases[0].created_at).time}
                          </span>
                        </>
                      ) : 'No orders'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-cyan-500">🕒</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Discount</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      Rp {totalDiscountGiven.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">given via vouchers</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-red-500">💸</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Unique Vouchers</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{uniqueVouchersUsed.length}</p>
                    <p className="text-xs text-gray-500 mt-1">different codes used</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-indigo-500">🏷️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-teal-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Discount</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {Math.round(averageDiscountRate * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per voucher order</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-teal-500">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-pink-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Voucher Rate</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {Math.round((purchasesWithVoucher.length / purchases.length) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">of orders use voucher</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-pink-500">🎯</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Product Distribution Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  📊 Product Distribution
                </h3>
                <div className="w-full max-w-md mx-auto">
                  <Pie data={pieData} options={chartOptions} />
                </div>
              </div>

              {/* Voucher Usage Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  🎫 Voucher Usage
                </h3>
                <div className="w-full max-w-md mx-auto">
                  <Pie data={voucherPieData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Purchase History Table dengan Jam & Waktu */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    📋 Purchase History (Latest First)
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className="text-gray-500 text-sm">
                      Total: {purchases.length} orders
                    </span>
                    <span className="text-gray-500 text-sm">
                      • With voucher: {purchasesWithVoucher.length}
                    </span>
                  </div>
                </div>
              </div>
              
              {purchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Product</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Size</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Qty</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Original</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Final</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Voucher</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Discount</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchases.map((purchase, index) => {
                        const originalTotal = (Number(purchase.price) || 0) * (Number(purchase.qty) || 0)
                        const finalTotal = Number(purchase.final_price) || originalTotal
                        const discount = originalTotal - finalTotal
                        const discountRate = purchase.discount_rate ? Math.round(purchase.discount_rate * 100) : 0
                        
                        const datetime = formatDateTime(purchase.created_at)
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            {/* Kolom Date & Time */}
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-gray-900">
                                {datetime.date}
                              </div>
                              <div className="text-xs text-gray-500">
                                {datetime.time}
                              </div>
                            </td>
                            
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {purchase.product_name || purchase.productId || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{purchase.size || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-center">{purchase.qty || 0}</td>
                            <td className="py-3 px-4 text-sm text-gray-500 line-through">
                              Rp {originalTotal.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-green-600">
                              Rp {finalTotal.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {purchase.voucher_code ? (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                  {purchase.voucher_code}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {discount > 0 ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  -Rp {discount.toLocaleString()} ({discountRate}%)
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">0%</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {purchase.payment_method ? (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium capitalize">
                                  {purchase.payment_method}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{purchase.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-500 font-mono">
                              {purchase.phone || 'N/A'}
                            </td>
<th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Notes</th>
<td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
  {purchase.notes ? (
    <details className="cursor-pointer">
      <summary className="text-blue-500 hover:text-blue-700 text-xs">
        View Notes
      </summary>
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-words">
        {purchase.notes}
      </div>
    </details>
  ) : (
    <span className="text-gray-400 text-xs">-</span>
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
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">📭</span>
                  </div>
                  <p className="text-gray-500 text-lg">No purchase data available</p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
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