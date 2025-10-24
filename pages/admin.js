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
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
      }
      const json = await res.json()
      setData(json || { purchases: [] })
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load purchase data')
      setData({ purchases: [] })
    } finally {
      setLoading(false)
    }
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <input
          type="password"
          placeholder="Admin password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="border rounded p-2 mb-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              if (pwd.trim() === (process.env.NEXT_PUBLIC_ADMIN_PASS || '').trim()) {
                setAuthorized(true)
              } else {
                alert('Wrong password')
              }
            }
          }}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={() => {
            if (pwd.trim() === (process.env.NEXT_PUBLIC_ADMIN_PASS || '').trim()) {
              setAuthorized(true)
            } else {
              alert('Wrong password')
            }
          }}
          disabled={!pwd.trim()}
        >
          Login
        </button>
      </div>
    )
  }

  // Safe calculations dengan optional chaining
  const purchases = data?.purchases || []
  
  const totalBought = purchases.reduce((s, p) => s + (p?.qty || 0), 0)
  
  const currentMonth = new Date().getMonth()
  const monthlyBuy = purchases.filter(
    (p) => new Date(p?.createdAt).getMonth() === currentMonth
  ).length

  // Count by product dengan safety check
  const countByProduct = {}
  purchases.forEach((p) => {
    if (p?.productId) {
      countByProduct[p.productId] = (countByProduct[p.productId] || 0) + (p.qty || 0)
    }
  })

  const mostBoughtEntries = Object.entries(countByProduct)
  const mostBought = mostBoughtEntries.length > 0 
    ? mostBoughtEntries.sort((a, b) => b[1] - a[1])[0] 
    : ['-', 0]

  // Chart data dengan fallback jika tidak ada data
  const pieData = {
    labels: Object.keys(countByProduct).length > 0 
      ? Object.keys(countByProduct) 
      : ['No Data'],
    datasets: [{
      data: Object.values(countByProduct).length > 0 
        ? Object.values(countByProduct) 
        : [1],
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
      legend: {
        position: 'bottom',
      },
    },
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button 
            onClick={() => setAuthorized(false)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Logout
          </button>
          <a href="/" className="text-sm underline">
            Back to Shop
          </a>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow">
              Monthly Buy
              <br />
              <strong className="text-xl">{monthlyBuy}</strong>
            </div>
            <div className="p-4 bg-white rounded shadow">
              Total Bought
              <br />
              <strong className="text-xl">{totalBought}</strong>
            </div>
            <div className="p-4 bg-white rounded shadow">
              Most Bought
              <br />
              <strong className="text-xl">
                {mostBought[0]} ({mostBought[1]})
              </strong>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Product Distribution</h3>
            <div className="w-72 mt-4 mx-auto">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

          <div className="mt-6 bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Raw Purchases</h3>
              <span className="text-sm text-gray-500">
                Total: {purchases.length} purchases
              </span>
            </div>
            <div className="mt-3 text-sm">
              {purchases.length > 0 ? (
                <pre className="whitespace-pre-wrap max-h-96 overflow-auto bg-gray-50 p-4 rounded">
                  {JSON.stringify(purchases, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No purchase data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
