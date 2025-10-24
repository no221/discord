import { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
ChartJS.register(ArcElement, Tooltip, Legend)

export default function Admin() {
  const [authorized, setAuthorized] = useState(false)
  const [pwd, setPwd] = useState('')
  const [data, setData] = useState({ purchases: [] })

  useEffect(() => {
    if (authorized) fetchData()
  }, [authorized])

  async function fetchData() {
    const res = await fetch('/api/purchase')
    const json = await res.json()
    setData(json)
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
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            if (pwd.trim() === (process.env.NEXT_PUBLIC_ADMIN_PASS || '').trim()) {
  setAuthorized(true)
} else {
  alert('Wrong password')
}
          }}
        >
          Login
        </button>
      </div>
    )
  }

  const totalBought = data.purchases.reduce((s, p) => s + p.qty, 0)
  const monthlyBuy = data.purchases.filter(
    (p) => new Date(p.createdAt).getMonth() === new Date().getMonth()
  ).length

  const countByProduct = {}
  data.purchases.forEach((p) => {
    countByProduct[p.productId] = (countByProduct[p.productId] || 0) + p.qty
  })
  const mostBought = Object.entries(countByProduct).sort((a, b) => b[1] - a[1])[0] || ['-', 0]

  const pieData = {
    labels: Object.keys(countByProduct),
    datasets: [{ data: Object.values(countByProduct) }],
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <a href="/" className="text-sm underline">
          Back to Shop
        </a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          Monthly Buy
          <br />
          <strong>{monthlyBuy}</strong>
        </div>
        <div className="p-4 bg-white rounded shadow">
          Total Bought
          <br />
          <strong>{totalBought}</strong>
        </div>
        <div className="p-4 bg-white rounded shadow">
          Most Bought
          <br />
          <strong>
            {mostBought[0]} ({mostBought[1]})
          </strong>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Distribution</h3>
        <div className="w-72 mt-4">
          <Pie data={pieData} />
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Raw purchases</h3>
        <div className="mt-3 text-sm">
          <pre className="whitespace-pre-wrap">{JSON.stringify(data.purchases, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
