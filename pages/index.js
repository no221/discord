'use client'
import { useState, useEffect } from 'react'
import { products } from '@/data/product'

function getDiscount(qty) {
  if (qty >= 30) return 0.15
  if (qty >= 20) return 0.1
  if (qty >= 10) return 0.07
  if (qty >= 7) return 0.05
  if (qty >= 3) return 0.03
  return 0
}

function useAnimatedNumber(value, duration = 300) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    let start = performance.now()
    const initial = display
    const diff = value - initial

    function animate(time) {
      const progress = Math.min((time - start) / duration, 1)
      setDisplay(Math.round(initial + diff * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [value])

  return display
}

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)
  const [selected, setSelected] = useState({ product: products[0], variant: products[0].variants[1] })
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    code: ''
  })
  const [status, setStatus] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
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
    setForm({ ...form, code: '' }) // reset discount code
    setCartOpen(true)
  }

  async function bayarNow() {
    setStatus('processing')
    try {
      const body = {
        productId: selected.product.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        size: selected.variant.size,
        price: selected.variant.price,
        qty,
        discountCode: form.code
      }
      await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      })
      setStatus('success')
      setShowSuccessPopup(true)
    } catch {
      setStatus('error')
    }
  }

  // animasi harga slot machine
  useEffect(() => {
    const oldPrice = displayPrice
    const newPrice = selected.variant.price
    if (oldPrice !== newPrice) {
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

  // Hitung harga dengan discount
  let discountRate = getDiscount(qty)
  if (form.code?.toLowerCase() === 'kelompok4') discountRate = Math.max(discountRate, 0.8)
  const priceBeforeDiscount = selected.variant.price * qty
  const discountedPrice = Math.round(priceBeforeDiscount * (1 - discountRate))
  const animatedPrice = useAnimatedNumber(discountedPrice, 300)

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-orange-50 to-white">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
          ⚽ Soccer Ball Shop - Steven
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product detail */}
        <section className="bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <img
              src={selected.product.images[imgIndex]}
              alt="product"
              className={`w-full h-64 object-contain rounded transition-opacity duration-300 ${imgAnim ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>

          <h2 className="mt-3 text-xl font-semibold">{selected.product.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{selected.product.description}</p>
          <p className="mt-2 text-lg font-bold text-orange-600">Rp {selected.variant.price.toLocaleString()}</p>

          <div className="mt-4">
            <button
              onClick={() => openCartFor(selected.product)}
              className="px-4 py-2 rounded bg-orange-500 text-white"
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
                  <div className="text-sm text-gray-600">Rp {p.variants[1].price.toLocaleString()}</div>
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

              {/* Variants */}
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

              {/* Input & Quantity */}
<div className="mt-3">
  <label className="block text-xs">Nama</label>
  <input
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    placeholder="Li fan"
    className="w-full border p-2 rounded text-sm text-gray-500/50"
  />

  <label className="block text-xs mt-2">Nomor Telepon</label>
  <input
    value={form.phone}
    onChange={(e) => setForm({ ...form, phone: e.target.value })}
    placeholder="+62 838-7380-3436"
    className="w-full border p-2 rounded text-sm text-gray-500/50"
  />

  <label className="block text-xs mt-2">Alamat</label>
  <input
    value={form.address}
    onChange={(e) => setForm({ ...form, address: e.target.value })}
    placeholder="jalan taman teratai 3 blok Hh 3 no. 18"
    className="w-full border p-2 rounded text-sm text-gray-500/50"
  />

  <label className="block text-xs mt-2">Discount Code</label>
  <input
    value={form.code}
    onChange={(e) => setForm({ ...form, code: e.target.value })}
    placeholder="Masukkan kode diskon"
    className="w-full border p-2 rounded text-sm text-gray-500/50"
  />
</div>

              {/* Quantity & Harga */}
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
                  {discountRate > 0 && (
                    <div className="text-sm text-gray-400 line-through">
                      Rp {priceBeforeDiscount.toLocaleString()}
                    </div>
                  )}
                  <div className="text-lg font-bold text-orange-600">
                    Rp {animatedPrice.toLocaleString()}
                  </div>
                  {discountRate > 0 && (
                    <div className="text-xs text-green-600">
                      Diskon {Math.round(discountRate * 100)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
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
            </div>
          </div>
        </div>
      </div>

{/* Popup Pesanan Diterima */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4 shadow-lg animate-fadeIn">
            <div className="text-6xl text-green-500 animate-bounce">✓</div>
            <div className="text-lg font-semibold">Pesananmu diterima!</div>
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded"
              onClick={() => {
                setShowSuccessPopup(false)
                setCartOpen(false)
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        Made by Kelompok-4
      </footer>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-bounce {
          animation: bounce 0.6s ease infinite alternate;
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}