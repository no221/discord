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

  const totalRevenue = purchases.reduce((sum, purchase) => sum + (Number(purchase?.price) || 0) * (Number(purchase?.qty) || 0), 0)

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      Rp {totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">gross income</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-purple-500">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Most Popular</p>
                    <p className="text-lg font-bold text-gray-800 mt-2 truncate" title={mostBought[0]}>
                      {mostBought[0]}
                    </p>
                    <p className="text-gray-600 text-sm">({mostBought[1]} sold)</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-orange-500">🔥</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{purchases.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-indigo-500">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Unique Customers</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{uniqueCustomers}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-pink-500">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      Rp {purchases.length > 0 ? Math.round(totalRevenue / purchases.length).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-teal-500">📊</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Chart Section */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  📊 Product Distribution
                </h3>
                <div className="w-full max-w-md mx-auto">
                  <Pie data={pieData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  📈 Recent Activity
                </h3>
                <div className="space-y-4">
                  {purchases.slice(0, 5).map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {purchase.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {purchase.product_name || purchase.productId} • {purchase.qty}x
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-800">
                          Rp {Number(purchase.price || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {purchase.created_at ? new Date(purchase.created_at).toLocaleDateString('id-ID') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {purchases.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase History Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    📋 Purchase History
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className="text-gray-500 text-sm">
                      Total: {purchases.length} orders
                    </span>
                    <span className="text-gray-500 text-sm">
                      • Unique products: {Object.keys(countByProduct).length}
                    </span>
                  </div>
                </div>
              </div>
              
              {purchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Product</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Size</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Qty</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Total</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchases.map((purchase, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {purchase.product_name || purchase.productId || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{purchase.size || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-center">{purchase.qty || 0}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">
                            Rp {Number(purchase.price || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-green-600">
                            Rp {((Number(purchase.price) || 0) * (Number(purchase.qty) || 0)).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{purchase.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{purchase.phone || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {purchase.created_at ? new Date(purchase.created_at).toLocaleDateString('id-ID') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">📭</span>
                  </div>
                  <p className="text-gray-500 text-lg">No purchase data available</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Purchases will appear here when customers complete orders
                  </p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-2xl font-bold">Rp {totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <p className="text-2xl font-bold">{purchases.length}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Avg per Order</p>
                  <p className="text-2xl font-bold">
                    Rp {purchases.length > 0 ? Math.round(totalRevenue / purchases.length).toLocaleString() : '0'}
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
