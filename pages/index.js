'use client'
import { useState, useEffect } from 'react'
import { products } from '@/data/product'

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)
  const [selected, setSelected] = useState({ product: products[0], variant: products[0].variants[1] })
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({
    name: 'Li fan',
    phone: '+62 838-7380-3436',
    address: 'jalan taman teratai 3 blok Hh 3 no. 18'
  })
  const [status, setStatus] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [imgAnim, setImgAnim] = useState(false)
  const [displayPrice, setDisplayPrice] = useState(selected.variant.price)

  useEffect(() => {
    setSelected({ product: products[0], variant: products[0].variants[1] })
  }, [])

  // auto-slide gambar
  useEffect(() => {
    const interval = setInterval(() => {
      handleImgChange((imgIndex + 1) % selected.product.images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [selected, imgIndex])

  function handleImgChange(newIndex) {
    setImgAnim(true)
    setTimeout(() => {
      setImgIndex(newIndex)
      setImgAnim(false)
    }, 300)
  }

  function openCartFor(product) {
    setSelected({ product, variant: product.variants[1] })
    setQty(1)
    setCartOpen(true)
  }

  async function bayarNow() {
    setStatus('processing')
    const body = {
      productId: selected.product.id,
      name: form.name,
      phone: form.phone,
      address: form.address,
      size: selected.variant.size,
      price: selected.variant.price,
      qty
    }
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      })
      await res.json()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  // animasi harga slot machine
  useEffect(() => {
    const oldPrice = displayPrice
    const newPrice = selected.variant.price
    if (oldPrice !== newPrice) {
      let start = oldPrice
      const diff = newPrice - oldPrice
      const steps = 15
      const stepValue = diff / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        setDisplayPrice(Math.round(oldPrice + stepValue * currentStep))
        if (currentStep >= steps) {
          clearInterval(interval)
          setDisplayPrice(newPrice)
        }
      }, 40)
    }
  }, [selected.variant.price])

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-orange-50 to-white">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
          ⚽ Soccer Ball Shop - Steven
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product detail */}
        <section className="bg-white p-4 rounded-lg shadow-lg">
          <div className="relative">
            <img
              src={selected.product.images[imgIndex]}
              alt="product"
              className={`w-full h-64 object-contain rounded transition-opacity duration-300 ${imgAnim ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            />
            <button
              onClick={() => handleImgChange((imgIndex - 1 + selected.product.images.length) % selected.product.images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 rounded"
            >
              ‹
            </button>
            <button
              onClick={() => handleImgChange((imgIndex + 1) % selected.product.images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 rounded"
            >
              ›
            </button>
          </div>

          <h2 className="mt-3 text-xl font-semibold">{selected.product.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{selected.product.description}</p>
          <p className="text-lg mt-2 font-mono transition-transform duration-300 text-orange-600">
            Rp {displayPrice.toLocaleString()}
          </p>

          <div className="mt-4">
            <button
              onClick={() => openCartFor(selected.product)}
              className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Beli Sekarang
            </button>
          </div>
        </section>

        {/* You may like this too */}
        <aside className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">You may like this too</h3>
          <div className="grid grid-cols-1 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 cursor-pointer hover:shadow-xl hover:scale-105 transition-transform rounded p-2"
                onClick={() => openCartFor(p)}
              >
                <img src={p.images[0]} alt="thumb" className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">
                    Rp {p.variants[1].price.toLocaleString()}
                  </div>
                </div>
                <button
                  className="text-sm px-3 py-1 border rounded"
                  onClick={(e) => { e.stopPropagation(); openCartFor(p) }}
                >
                  Tambah
                </button>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {/* Cart popup */}
      <div
        className={`fixed left-0 right-0 bottom-0 transition-transform ${
          cartOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-t-xl shadow-lg">
          <div className="flex items-start gap-4">
            <img
              src={selected.product.images[0]}
              alt="small"
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <div className="font-semibold">{selected.product.name}</div>
              <div className="text-sm mt-2">Variants</div>

              <table className="w-full mt-2 text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Size</th>
                    <th>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.product.variants.map((v) => (
                    <tr
                      key={v.size}
                      className={`cursor-pointer ${selected.variant.size === v.size ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelected({ ...selected, variant: v })}
                    >
                      <td className="py-2">{v.size}</td>
                      <td>Rp {v.price.toLocaleString()}</td>
                      <td>{selected.variant.size === v.size ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3">
                <label className="block text-xs">Nama</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border p-2 rounded text-sm text-gray-500/50"
                />
                <label className="block text-xs mt-2">No. Telp</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border p-2 rounded text-sm text-gray-500/50"
                />
                <label className="block text-xs mt-2">Alamat</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border p-2 rounded text-sm text-gray-500/50"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-sm">Quantity</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-2 border rounded"
                    >
                      -
                    </button>
                    <div>{qty}</div>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-2 border rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Total</div>
                  <div className="text-lg font-bold">
                    Rp {(selected.variant.price * qty).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setCartOpen(false)}
                  className="flex-1 py-2 border rounded"
                >
                  Tutup
                </button>
                <button
                  onClick={bayarNow}
                  className="flex-1 py-2 rounded bg-emerald-600 text-white"
                >
                  Bayar Sekarang
                </button>
              </div>

              {status === 'success' && (
                <div className="mt-3 text-green-600">
                  Pembelian berhasil! Terima kasih.
                </div>
              )}
{status === 'processing' && (
                <div className="mt-3 text-gray-600">Memproses...</div>
              )}
              {status === 'error' && (
                <div className="mt-3 text-red-600">Ada kesalahan. Coba lagi.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}