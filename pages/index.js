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
  const [productChangeAnim, setProductChangeAnim] = useState(false)
  const [variantChangeAnim, setVariantChangeAnim] = useState(false)

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
    // Animasi pergantian product
    setProductChangeAnim(true)
    setTimeout(() => {
      setSelected({ product, variant: product.variants[1] })
      setQty(1)
      setForm({ ...form, code: '' })
      setProductChangeAnim(false)
      setCartOpen(true)
    }, 300)
  }

  function handleVariantChange(v) {
    // Animasi pergantian variant
    setVariantChangeAnim(true)
    setTimeout(() => {
      setSelected(prev => ({ ...prev, variant: v }))
      setTimeout(() => setVariantChangeAnim(false), 200)
    }, 150)
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Soccer Ball Pattern */}
        <div className="absolute top-1/4 -left-10 w-20 h-20 opacity-20 animate-spin-slow">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Floating Balls - More Visible */}
        <div className="absolute top-10 left-10 w-8 h-8 bg-orange-400 rounded-full animate-float1 opacity-70 shadow-lg"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-amber-500 rounded-full animate-float2 opacity-60 shadow-lg"></div>
        <div className="absolute bottom-32 left-20 w-6 h-6 bg-orange-300 rounded-full animate-float3 opacity-80 shadow-md"></div>
        <div className="absolute bottom-20 right-32 w-10 h-10 bg-red-400 rounded-full animate-float4 opacity-70 shadow-lg"></div>
        <div className="absolute top-64 left-1/4 w-7 h-7 bg-yellow-400 rounded-full animate-float5 opacity-75 shadow-md"></div>
        
        {/* Moving Gradient Lines */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400 animate-slide-line1"></div>
          <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400 animate-slide-line2"></div>
          <div className="absolute bottom-40 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-400 animate-slide-line3"></div>
        </div>
        
        {/* Pulse Rings - More Visible */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 border-4 border-orange-300 rounded-full animate-pulse-ring-slow opacity-40"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 border-4 border-amber-200 rounded-full animate-pulse-ring-slower opacity-30"></div>
        
        {/* Bouncing Dots */}
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-orange-500 rounded-full animate-bounce-dot opacity-60"></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-amber-500 rounded-full animate-bounce-dot-delayed opacity-60"></div>
      </div>

      <header className="flex items-center justify-between mb-6 relative z-10">
        <h1 className="text-2xl font-bold text-orange-700 flex items-center gap-2 animate-pulse-gentle">
          ⚽ Soccer Ball Shop - Steven
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Product detail */}
        <section className={`bg-white p-4 rounded-lg shadow-xl backdrop-blur-sm bg-white/90 transition-all duration-500 ${
          productChangeAnim ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}>
          <div className="relative">
            <img
              src={selected.product.images[imgIndex]}
              alt="product"
              className={`w-full h-64 object-contain rounded transition-all duration-500 ${
                imgAnim ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            />
          </div>

          <h2 className="mt-3 text-xl font-semibold">{selected.product.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{selected.product.description}</p>
          <p className="mt-2 text-lg font-bold text-orange-600">Rp {selected.variant.price.toLocaleString()}</p>

          <div className="mt-4">
            <button
              onClick={() => openCartFor(selected.product)}
              className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse-gentle"
            >
              Beli Sekarang
            </button>
          </div>
        </section>

        {/* You may like this too */}
        <aside className="bg-white p-4 rounded-lg shadow-xl backdrop-blur-sm bg-white/90">
          <h3 className="font-semibold mb-2">You may like this too</h3>
          <div className="grid grid-cols-1 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 rounded p-2 bg-white/80 backdrop-blur-sm border border-transparent hover:border-orange-200"
                onClick={() => openCartFor(p)}
              >
                <img src={p.images[0]} alt="thumb" className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">Rp {p.variants[1].price.toLocaleString()}</div>
                </div>
                <button
                  className="text-sm px-3 py-1 border rounded hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); openCartFor(p) }}
                >
                  Tambah
                </button>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {/* Enhanced Cart Popup - Now goes off screen */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-700 ease-in-out ${
          cartOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible translate-y-full'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
        
        {/* Cart Content */}
        <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 bg-white/95 backdrop-blur-md rounded-t-2xl shadow-2xl border-t border-orange-100 transform transition-transform duration-500">
            <div className="flex items-start gap-4">
              <img
                src={selected.product.images[0]}
                alt="small"
                className="w-20 h-20 object-cover rounded shadow-lg"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg">{selected.product.name}</div>

                {/* Variants with Slide Animation */}
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
                        className={`cursor-pointer transition-all duration-300 ${
                          selected.variant.size === v.size 
                            ? 'bg-orange-50 border-l-4 border-orange-500 shadow-inner' 
                            : 'hover:bg-gray-50'
                        } ${
                          variantChangeAnim && selected.variant.size === v.size 
                            ? 'animate-variant-select' 
                            : ''
                        }`}
                        onClick={() => handleVariantChange(v)}
                      >
                        <td className="py-2 pl-2">{v.size}</td>
                        <td>Rp {v.price.toLocaleString()}</td>
                        <td className="text-orange-500">
                          {selected.variant.size === v.size ? '✓' : ''}
                        </td>
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
                    className="w-full border p-2 rounded text-sm transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />

                  <label className="block text-xs mt-2">Nomor Telepon</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+62 838-7380-3436"
                    className="w-full border p-2 rounded text-sm transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />

                  <label className="block text-xs mt-2">Alamat</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="jalan taman teratai 3 blok Hh 3 no. 18"
                    className="w-full border p-2 rounded text-sm transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />

                  <label className="block text-xs mt-2">Discount Code</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Masukkan kode diskon"
                    className="w-full border p-2 rounded text-sm transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Quantity & Harga */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm">Quantity</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="px-3 py-1 border rounded hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:scale-110"
                      >
                        -
                      </button>
                      <div className="px-3 py-1 bg-orange-50 rounded min-w-8 text-center">{qty}</div>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="px-3 py-1 border rounded hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:scale-110"
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
                    className="flex-1 py-2 border rounded hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={bayarNow}
                    className="flex-1 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Pesanan Diterima */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4 shadow-2xl animate-fadeIn border border-orange-200">
            <div className="text-6xl text-green-500 animate-bounce">✓</div>
            <div className="text-lg font-semibold">Pesananmu diterima!</div>
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
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
      <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t border-gray-200 relative z-10 backdrop-blur-sm bg-white/50">
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
        .animate-float1 {
          animation: float1 6s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 8s ease-in-out infinite;
        }
        .animate-float3 {
          animation: float3 7s ease-in-out infinite;
        }
        .animate-float4 {
          animation: float4 10s ease-in-out infinite;
        }
        .animate-float5 {
          animation: float5 9s ease-in-out infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-30px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(15px) translateX(-15px) rotate(240deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(25px) translateX(-25px) scale(1.1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(-10px); }
          75% { transform: translateY(10px) translateX(15px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(35px) translateX(20px) rotate(180deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-15px) translateX(25px); }
          66% { transform: translateY(20px) translateX(-10px); }
        }
        .animate-slide-line1 {
          animation: slideLine 8s linear infinite;
        }
        .animate-slide-line2 {
          animation: slideLine 12s linear infinite;
        }
        .animate-slide-line3 {
          animation: slideLine 10s linear infinite;
        }
        @keyframes slideLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-pulse-ring-slow {
          animation: pulseRing 8s ease-in-out infinite;
        }
        .animate-pulse-ring-slower {
          animation: pulseRing 12s ease-in-out infinite;
        }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-bounce-dot {
          animation: bounceDot 2s ease-in-out infinite;
        }
        .animate-bounce-dot-delayed {
          animation: bounceDot 2s ease-in-out infinite 1s;
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-pulse-gentle {
          animation: pulseGentle 3s ease-in-out infinite;
        }
        @keyframes pulseGentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-variant-select {
          animation: variantSelect 0.3s ease-out;
        }
        @keyframes variantSelect {
          0% { background-color: transparent; }
          50% { background-color: rgba(249, 115, 22, 0.2); }
          100% { background-color: rgb(255, 247, 237); }
        }
      `}</style>
    </div>
  )
}