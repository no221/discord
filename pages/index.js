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
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'product', 'cart'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    code: ''
  })
  const [status, setStatus] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add to cart function
  function addToCart(product, variant, quantity) {
    const existingItem = cart.find(item => 
      item.product.id === product.id && item.variant.size === variant.size
    )

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id && item.variant.size === variant.size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, {
        product,
        variant,
        quantity
      }])
    }
  }

  // Remove from cart
  function removeFromCart(productId, variantSize) {
    setCart(cart.filter(item => 
      !(item.product.id === productId && item.variant.size === variantSize)
    ))
  }

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => {
    const discountRate = getDiscount(item.quantity)
    const priceBeforeDiscount = item.variant.price * item.quantity
    return total + Math.round(priceBeforeDiscount * (1 - discountRate))
  }, 0)

  // Open product detail
  function openProductDetail(product) {
    setSelectedProduct(product)
    setSelectedVariant(product.variants[1])
    setQty(1)
    setCurrentPage('product')
  }

  // Handle checkout
  async function handleCheckout() {
    setStatus('processing')
    try {
      const orderData = {
        items: cart,
        customer: form,
        total: totalPrice
      }
      
      await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      setStatus('success')
      setShowSuccessPopup(true)
      setCart([])
      setCartOpen(false)
    } catch {
      setStatus('error')
    }
  }

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
      </div>

      {/* Header dengan Search dan Cart */}
      <header className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <h1 
            className="text-2xl font-bold text-orange-700 flex items-center gap-2 animate-pulse-gentle cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            ⚽ Soccer Ball Shop - Steven
          </h1>
          
          {/* Search Bar - hanya muncul di homepage */}
          {currentPage === 'home' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <div className="relative">
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 relative"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </button>

          {/* Cart Dropdown */}
          {cartOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-2xl border border-orange-100 z-50">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Keranjang Belanja</h3>
                
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 py-2 border-b">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.product.name}</div>
                            <div className="text-xs text-gray-600">Size: {item.variant.size}</div>
                            <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              Rp {Math.round(item.variant.price * item.quantity * (1 - getDiscount(item.quantity))).toLocaleString()}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.variant.size)}
                              className="text-red-500 text-xs hover:text-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>Rp {totalPrice.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => {
                          setCartOpen(false)
                          setCurrentPage('cart')
                        }}
                        className="w-full mt-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Homepage - All Products */}
        {currentPage === 'home' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Semua Produk Bola</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow-lg backdrop-blur-sm bg-white/90 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => openProductDetail(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  <p className="mt-2 text-lg font-bold text-orange-600">
                    Rp {product.variants[1].price.toLocaleString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(product, product.variants[1], 1)
                    }}
                    className="w-full mt-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Detail Page */}
        {currentPage === 'product' && selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Detail */}
            <section className="bg-white p-4 rounded-lg shadow-xl backdrop-blur-sm bg-white/90">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-64 object-contain rounded mb-3"
              />
              <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
              
              {/* Variant Selection */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Pilih Size:</h4>
                <div className="flex gap-2">
                  {selectedProduct.variants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border rounded-lg transition-all duration-300 ${
                        selectedVariant.size === variant.size
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                      }`}
                    >
                      {variant.size} - Rp {variant.price.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-1 border rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-orange-50 rounded-lg">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-1 border rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedVariant, qty)
                    setQty(1)
                  }}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
                >
                  Add to Cart
                </button>
              </div>

              <button
                onClick={() => setCurrentPage('home')}
                className="w-full mt-3 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-all duration-300"
              >
                Kembali ke Home
              </button>
            </section>

            {/* You May Like This Too */}
            <aside className="bg-white p-4 rounded-lg shadow-xl backdrop-blur-sm bg-white/90">
              <h3 className="font-semibold mb-4">You may like this too</h3>
              <div className="grid grid-cols-1 gap-3">
                {products
                  .filter(p => p.id !== selectedProduct.id)
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all duration-300 rounded p-2 border border-transparent hover:border-orange-200"
                      onClick={() => openProductDetail(p)}
                    >
                      <img src={p.images[0]} alt="thumb" className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">Rp {p.variants[1].price.toLocaleString()}</div>
                      </div>
                      <button
                        className="text-sm px-3 py-1 border rounded hover:bg-orange-500 hover:text-white transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(p, p.variants[1], 1)
                        }}
                      >
                        Tambah
                      </button>
                    </div>
                  ))}
              </div>
            </aside>
          </div>
        )}

        {/* Cart/Checkout Page */}
        {currentPage === 'cart' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6 backdrop-blur-sm bg-white/90">
            <h2 className="text-xl font-semibold mb-4">Checkout</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Keranjang Anda kosong</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
                >
                  Belanja Sekarang
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-semibold">{item.product.name}</div>
                        <div className="text-sm text-gray-600">Size: {item.variant.size}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          Rp {Math.round(item.variant.price * item.quantity * (1 - getDiscount(item.quantity))).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.variant.size)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Informasi Pelanggan</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Masukkan nomor telepon"
                      className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Masukkan alamat lengkap"
                      rows="3"
                      className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Kode Diskon (Opsional)</label>
                    <input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="Masukkan kode diskon"
                      className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Pembayaran:</span>
                      <span>Rp {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCurrentPage('home')}
                      className="flex-1 py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-all duration-300"
                    >
                      Kembali Belanja
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={!form.name || !form.phone || !form.address}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4 shadow-2xl animate-fadeIn border border-orange-200">
            <div className="text-6xl text-green-500 animate-bounce">✓</div>
            <div className="text-lg font-semibold">Pesananmu diterima!</div>
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                setShowSuccessPopup(false)
                setCurrentPage('home')
              }}
            >
              Kembali ke Home
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
      `}</style>
    </div>
  )
}