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
    name: 'Li fan',
    phone: '+62 838-7380-3436',
    address: 'jalan taman teratai 3 blok Hh 3 no. 18'
  })
  const [status, setStatus] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [imgAnim, setImgAnim] = useState(false)
  const [displayPrice, setDisplayPrice] = useState(selected.variant.price)
  const [showInvoice, setShowInvoice] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [invoiceData, setInvoiceData] = useState(null)
  const [rating, setRating] = useState(0)

  const discountRate = discountCode.toLowerCase() === 'kelompok 4' ? 0.8 : getDiscount(qty)
  const priceBeforeTax = selected.variant.price * qty
  const discountedPrice = priceBeforeTax * (1 - discountRate)
  const finalPrice = Math.round(discountedPrice)

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

      // buat invoice popup
      const orderId = `INV-${Date.now()}`
      const courierOptions = ['JNE', 'J&T', 'Shopee Express', 'Grab']
      setInvoiceData({
        orderId,
        name: form.name,
        phone: form.phone,
        address: form.address,
        product: selected.product.name,
        qty,
        finalPrice,
        courier: courierOptions[Math.floor(Math.random() * courierOptions.length)],
        orderTime: new Date().toLocaleString(),
        estimatedDelivery: `${Math.floor(Math.random() * 3) + 2} hari kerja`
      })

      setShowInvoice(true)
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
      const steps = 15
      const stepValue = (newPrice - oldPrice) / steps
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

  async function submitRating() {
    if (!rating || !invoiceData) return
    try {
      await fetch('/api/rating', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          name: invoiceData.name,
          rating
        })
      })
      alert('Terima kasih atas ratingmu!')
    } catch {
      alert('Gagal submit rating')
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
          ⚽ Soccer Ball Shop - Steven
        </h1>
      </header>

      {/* Main */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="mt-4 text-right">
            {discountRate > 0 && (
              <div className="text-sm text-gray-400 line-through">
                Rp {priceBeforeTax.toLocaleString()}
              </div>
            )}
            <div className="text-lg font-bold text-orange-600">
              Rp {finalPrice.toLocaleString()}
            </div>
            {discountRate > 0 && (
              <div className="text-xs text-green-600">
                Diskon {Math.round(discountRate * 100)}%
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => openCartFor(selected.product)}
              className="px-4 py-2 rounded bg-orange-500 text-white"
            >
              Beli Sekarang
            </button>
          </div>
        </section>

        {/* You may like */}
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

      {/* Footer */}
      <footer className="mt-6 p-4 text-center text-gray-500">
        ⚽ Soccer Ball Shop - Kelompok 4
      </footer>

      {/* Cart popup */}
      {cartOpen && !showInvoice && (
        <div className="fixed left-0 right-0 bottom-0 top-0 bg-black/40 flex items-end justify-center transition-transform">
          <div className="max-w-4xl w-full p-4 bg-white rounded-t-xl shadow-lg">
            <div className="flex items-start gap-4">
              <img src={selected.product.images[0]} alt="small" className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold">{selected.product.name}</div>

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

                {/* Input */}
                <div className="mt-3">
                  <label className="block text-xs">Nama</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border p-2 rounded text-sm text-gray-500/50"
                  />
                  <label className="block text-xs mt-2">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border p-2 rounded text-sm text-gray-500/50"
                  />
                  <label className="block text-xs mt-2">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border p-2 rounded text-sm text-gray-500/50"
                  />
                  <label className="block text-xs mt-2">Discount Code</label>
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Masukkan kode jika ada"
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
                    {discountRate > 0 && (
                      <div className="text-sm text-gray-400 line-through">
                        Rp {priceBeforeTax.toLocaleString()}
                      </div>
                    )}
                    <div className="text-lg font-bold text-orange-600">
                      Rp {finalPrice.toLocaleString()}
                    </div>
                    {discountRate > 0 && (
                      <div className="text-xs text-green-600">
                        Diskon {Math.round(discountRate * 100)}%
                      </div>
                    )}
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Popup */}
      {showInvoice && invoiceData && (
        <div className="fixed left-0 right-0 top-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-xl w-full shadow-2xl animate-slide-in">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-2">✔</div>
              <div className="text-xl font-bold mb-4">Pesananmu diterima!</div>
              <div className="text-left space-y-2 text-sm">
                <div><strong>Order ID:</strong> {invoiceData.orderId}</div>
                <div><strong>Product:</strong> {invoiceData.product} x {invoiceData.qty}</div>
                <div><strong>Nama:</strong> {invoiceData.name}</div>
                <div><strong>Phone:</strong> {invoiceData.phone}</div>
                <div><strong>Address:</strong> {invoiceData.address}</div>
                <div><strong>Courier:</strong> {invoiceData.courier}</div>
                <div><strong>Time:</strong> {invoiceData.orderTime}</div>
                <div><strong>Estimated Delivery:</strong> {invoiceData.estimatedDelivery}</div>
                <div><strong>Total:</strong> Rp {invoiceData.finalPrice.toLocaleString()}</div>
              </div>
async function submitRating() {
  if (!rating) return;
  try {
    await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: invoiceData.orderId, rating }),
    });
    alert('Terima kasih atas ratingnya!');
  } catch (err) {
    alert('Gagal submit rating');
  }
}
              {/* Rating */}
              <div className="mt-4">
                <div className="mb-2 font-semibold text-sm">Beri rating pesanan:</div>
                <div className="flex gap-1 justify-center">
                  {[1,2,3,4,5].map((i) => (
                    <button
                      key={i}
                      className={`text-2xl ${rating >= i ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => setRating(i)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  onClick={submitRating}
                  className="mt-2 w-full py-2 rounded bg-blue-500 text-white text-sm"
                >
                  Submit Rating
                </button>
              </div>

              <button
                className="mt-4 px-6 py-2 rounded bg-orange-500 text-white"
                onClick={() => { setShowInvoice(false); setCartOpen(false); }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}