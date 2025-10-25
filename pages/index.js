tolong bikin transisi light & dark theme lebih smooth dan animasi lainya ya.
'use client'
import { useState, useEffect, useCallback } from 'react'
import { products } from '@/data/product'

function getDiscount(qty) {
  if (qty >= 30) return 0.15
  if (qty >= 20) return 0.1
  if (qty >= 10) return 0.07
  if (qty >= 7) return 0.05
  if (qty >= 3) return 0.03
  return 0
}

const voucherDiscounts = {
  'kelompok4': 0.8,
  'soccer50': 0.5,
  'bola30': 0.3,
  'football20': 0.2,
  'steven10': 0.1
}

function useAnimatedNumber(value, duration = 400) {
  const [display, setDisplay] = useState(value)
  
  useEffect(() => {
    let start = null
    const initial = display
    const diff = value - initial
    let animationFrame

    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setDisplay(Math.round(initial + diff * easeOutQuart))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  return display
}

function useItemPriceAnimation(price, duration = 400) {
  const [displayPrice, setDisplayPrice] = useState(price)
  
  useEffect(() => {
    let start = null
    const initial = displayPrice
    const diff = price - initial
    let animationFrame

    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      
      const easeOutBack = 1 + (1 - progress) * (1 - progress) * (2.70158 * progress - 1.70158)
      
      setDisplayPrice(Math.round(initial + diff * easeOutBack))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [price, duration])

  return displayPrice
}

function useAnimatedQuantity(quantity, duration = 200) {
  const [displayQty, setDisplayQty] = useState(quantity)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (displayQty !== quantity) {
      setIsAnimating(true)
      setDisplayQty(quantity)
      
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [quantity, duration])

  return { displayQty, isAnimating }
}

const extractImageUrl = (url) => {
  if (!url) return '';
  
  if (url.startsWith('http')) return url;
  
  if (url.includes('imgur.com')) {
    if (url.includes('/a/')) {
      const albumId = url.split('/a/')[1]?.split('/')[0]?.split('?')[0];
      return `https://i.imgur.com/${albumId}.jpg`;
    }
    else if (url.includes('/gallery/')) {
      const galleryId = url.split('/gallery/')[1]?.split('/')[0]?.split('?')[0];
      return `https://i.imgur.com/${galleryId}.jpg`;
    }
    else if (url.includes('i.imgur.com')) {
      return url;
    }
    else {
      const imageId = url.split('imgur.com/')[1]?.split('/')[0]?.split('?')[0];
      if (imageId) {
        return `https://i.imgur.com/${imageId}.jpg`;
      }
    }
  }
  
  return url;
}

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-white via-orange-50 to-amber-100 flex flex-col items-center justify-center z-50 overflow-hidden">
    <script
      src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.7.1/dist/dotlottie-wc.js"
      type="module"
    ></script>

<dotlottie-wc
  src="https://lottie.host/1c3064dd-d28a-47fe-87a0-02568900c10f/bLwdshhf87.lottie"
  speed="1"
  style={{ width: '300px', height: '300px' }}
  mode="forward"
  loop
  autoplay
></dotlottie-wc>

<div className="mt-4 text-center">
  <h2 className="text-3xl font-bold text-orange-700 relative overflow-hidden">
    <span className="inline-block animate-slide-mask">Selamat Datang!</span>
  </h2>
  <p className="text-lg text-orange-600 mt-2 relative overflow-hidden">
    <span className="inline-block animate-slide-mask-delayed">Made By Kelompok 4</span>
  </p>
</div>

    <style jsx>{`
      @keyframes slideMask {
        0% {
          clip-path: inset(0 100% 0 0);
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% {
          clip-path: inset(0 0 0 0);
          opacity: 1;
        }
      }
      .animate-slide-mask {
        animation: slideMask 1.2s ease-out forwards;
      }
      .animate-slide-mask-delayed {
        animation: slideMask 1.2s ease-out 0.6s forwards;
      }
    `}</style>
  </div>
);

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    code: '',
    paymentMethod: ''
  })
  const [status, setStatus] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageAnim, setImageAnim] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [priceUpdateKey, setPriceUpdateKey] = useState(0)
  const [quantityUpdateKey, setQuantityUpdateKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [pageTransition, setPageTransition] = useState(false)
  const [theme, setTheme] = useState('light')
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false)

const paymentMethods = [
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    description: 'Bayar dengan saldo ShopeePay',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/330px-Shopee.svg.png'
  },
  {
    id: 'dana',
    name: 'DANA',
    description: 'Bayar dengan DANA - Cepat & Aman',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/330px-Logo_dana_blue.svg.png'
  },
  {
    id: 'ovo',
    name: 'OVO',
    description: 'Bayar dengan OVO - Cashless Payment',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/330px-Logo_ovo_purple.svg.png'
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    description: 'Bayar dengan LinkAja - Satu untuk Semua',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/LinkAja.svg/240px-LinkAja.svg.png'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Bayar dengan PayPal - International Payment',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg'
  },
  {
    id: 'cod',
    name: 'Cash Or Duel',
    description: 'Bayar di Tempat untuk memastikan kualitas barang',
    icon: 'https://cdn-icons-png.flaticon.com/512/679/679720.png'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Bayar dengan Kartu Kredit atau Debit',
    icon: 'https://cdn-icons-png.flaticon.com/512/633/633611.png'
  }
]

  const allTags = ['all', ...new Set(products.flatMap(product => product.tags || []))]

  const toggleTheme = useCallback(() => {
    if (isThemeTransitioning) return;
    
    setIsThemeTransitioning(true);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    document.documentElement.classList.add('theme-transition');
    
    setTimeout(() => {
      setTheme(newTheme);
    }, 150);
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
      setIsThemeTransitioning(false);
    }, 600);
  }, [theme, isThemeTransitioning]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const navigateToPage = useCallback((page) => {
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(page);
      setTimeout(() => {
        setPageTransition(false);
      }, 300);
    }, 300);
  }, []);

  const filteredProducts = products.filter(product =>
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedTag === 'all' || (product.tags && product.tags.includes(selectedTag)))
  )

  const getRecommendedProducts = useCallback((currentProduct) => {
    if (!currentProduct) return [];
    
    return products
      .filter(p => 
        p.id !== currentProduct.id && 
        p.tags && 
        currentProduct.tags && 
        p.tags.some(tag => currentProduct.tags.includes(tag))
      )
      .slice(0, 3);
  }, []);

  const calculateDiscount = useCallback((quantity, voucherCode = '') => {
    let discountRate = getDiscount(quantity)
    
    if (voucherCode) {
      const voucherDiscount = voucherDiscounts[voucherCode.toLowerCase()]
      if (voucherDiscount) {
        discountRate = Math.max(discountRate, voucherDiscount)
      }
    }
    
    return discountRate
  }, [])

  const calculateProductPrice = useCallback(() => {
    if (!selectedVariant) return { priceBeforeDiscount: 0, discountedPrice: 0, discountRate: 0 }
    
    const discountRate = calculateDiscount(qty, form.code)
    const priceBeforeDiscount = selectedVariant.price * qty
    const discountedPrice = Math.round(priceBeforeDiscount * (1 - discountRate))
    
    return { priceBeforeDiscount, discountedPrice, discountRate }
  }, [selectedVariant, qty, form.code, calculateDiscount])

  const calculateTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => {
      const itemTotal = item.variant.price * item.quantity
      const discountRate = calculateDiscount(item.quantity, form.code)
      return total + Math.round(itemTotal * (1 - discountRate))
    }, 0)
  }, [cart, form.code, calculateDiscount])

  const calculateItemPrice = useCallback((item) => {
    const itemTotal = item.variant.price * item.quantity
    const discountRate = calculateDiscount(item.quantity, form.code)
    const discountedPrice = Math.round(itemTotal * (1 - discountRate))
    return { itemTotal, discountedPrice, discountRate }
  }, [form.code, calculateDiscount])

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  const { priceBeforeDiscount, discountedPrice, discountRate } = calculateProductPrice()
  const totalPrice = calculateTotalPrice()
  const animatedPrice = useAnimatedNumber(discountedPrice, 400)
  const animatedTotalPrice = useAnimatedNumber(totalPrice, 500)

  useEffect(() => {
    if (form.code && voucherDiscounts[form.code.toLowerCase()]) {
      setVoucherApplied(true)
    } else {
      setVoucherApplied(false)
    }
  }, [form.code])

  useEffect(() => {
    if (selectedProduct && currentPage === 'product') {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % selectedProduct.images.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [selectedProduct, currentImageIndex, currentPage])

  const handleImageChange = useCallback((newIndex) => {
    setImageAnim(true)
    setTimeout(() => {
      setCurrentImageIndex(newIndex)
      setImageAnim(false)
    }, 300)
  }, [])

  const addToCart = useCallback((product, variant, quantity) => {
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
    
    setPriceUpdateKey(prev => prev + 1)
    setQuantityUpdateKey(prev => prev + 1)
    
    setCartOpen(true)
  }, [cart])

  const removeFromCart = useCallback((productId, variantSize) => {
    setCart(cart.filter(item => 
      !(item.product.id === productId && item.variant.size === variantSize)
    ))
    setPriceUpdateKey(prev => prev + 1)
    setQuantityUpdateKey(prev => prev + 1)
  }, [cart])

  const updateQuantity = useCallback((productId, variantSize, newQuantity) => {
    if (newQuantity < 1) return
    
    setCart(cart.map(item =>
      item.product.id === productId && item.variant.size === variantSize
        ? { ...item, quantity: newQuantity }
        : item
    ))
    
    setPriceUpdateKey(prev => prev + 1)
    setQuantityUpdateKey(prev => prev + 1)
  }, [cart])

  const openProductDetail = useCallback((product) => {
    setSelectedProduct(product)
    setSelectedVariant(product.variants[1])
    setCurrentImageIndex(0)
    setQty(1)
    navigateToPage('product')
    setCartOpen(false)
  }, [navigateToPage])

const handleCheckout = useCallback(async () => {
  if (!form.paymentMethod) {
    alert('Pilih metode pembayaran terlebih dahulu!')
    return
  }

  setStatus('processing')
  try {
    // Untuk setiap item di cart, kirim sebagai purchase terpisah
    for (const item of cart) {
      const purchaseData = {
        productId: item.product.id.toString(),
        product_name: item.product.name,
        size: item.variant.size.toString(),
        price: item.variant.price,
        qty: item.quantity,
        name: form.name,
        phone: form.phone,
        address: form.address,
        paymentMethod: form.paymentMethod,
        voucher_code: form.code || null, // ✅ TAMBAH INI - simpan kode voucher
        discount_rate: voucherApplied ? calculateDiscount(item.quantity, form.code) : 0, // ✅ TAMBAH discount rate
        final_price: voucherApplied ? Math.round(item.variant.price * item.quantity * (1 - calculateDiscount(item.quantity, form.code))) : item.variant.price * item.quantity // ✅ Harga setelah diskon
      }

      console.log('📦 Sending purchase:', purchaseData)

      await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(purchaseData)
      })
    }
    
    setStatus('success')
    setShowSuccessPopup(true)
    setCart([])
    setCartOpen(false)
  } catch (error) {
    console.error('Checkout error:', error)
    setStatus('error')
  }
}, [cart, form, totalPrice, voucherApplied, calculateDiscount])

  useEffect(() => {
    function handleClickOutside(event) {
      if (cartOpen && !event.target.closest('.cart-container') && !event.target.closest('.cart-icon')) {
        setCartOpen(false)
      }
      if (paymentOpen && !event.target.closest('.payment-container')) {
        setPaymentOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cartOpen, paymentOpen])

  const renderProductImage = (imageUrl, alt, className = "") => {
    const processedUrl = extractImageUrl(imageUrl);
    
    return (
      <img
        src={processedUrl}
        alt={alt}
        className={className}
        onError={(e) => {
          e.target.src = '/api/placeholder/400/400';
          e.target.alt = 'Gambar tidak tersedia';
        }}
      />
    );
  };

  const AnimatedQuantity = ({ quantity }) => {
    const { displayQty, isAnimating } = useAnimatedQuantity(quantity, 300)
    
    return (
      <span className={`font-semibold transition-all duration-200 ${
        isAnimating ? 'animate-quantity-bounce text-orange-600 scale-125' : ''
      }`}>
        {displayQty}
      </span>
    )
  }

  const CartItemWithAnimation = ({ item, index }) => {
    const { itemTotal, discountedPrice, discountRate } = calculateItemPrice(item)
    const animatedItemPrice = useItemPriceAnimation(discountedPrice, 400)
    const animatedOriginalPrice = useItemPriceAnimation(itemTotal, 400)

    return (
      <div key={`${item.product.id}-${item.variant.size}-${index}-${priceUpdateKey}`} 
           className="flex items-center gap-3 py-3 border-b animate-item-slide-in">
        {renderProductImage(
          item.product.images[0], 
          item.product.name, 
          "w-12 h-12 object-cover rounded"
        )}
        <div className="flex-1">
          <div className="font-medium text-sm">{item.product.name}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Size: {item.variant.size}</div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => updateQuantity(item.product.id, item.variant.size, item.quantity - 1)}
              className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              -
            </button>
            <AnimatedQuantity quantity={item.quantity} />
            <button
              onClick={() => updateQuantity(item.product.id, item.variant.size, item.quantity + 1)}
              className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-orange-600 animate-price-spring">
            Rp {animatedItemPrice.toLocaleString()}
          </div>
          {discountRate > 0 && (
            <div className="text-xs text-green-600 animate-fade-in">
              Diskon {Math.round(discountRate * 100)}%
              {voucherApplied && ` (Voucher)`}
            </div>
          )}
          {discountRate > 0 && (
            <div className="text-xs text-gray-400 line-through animate-strike">
              Rp {animatedOriginalPrice.toLocaleString()}
            </div>
          )}
          <button
            onClick={() => removeFromCart(item.product.id, item.variant.size)}
            className="text-red-500 text-xs hover:text-red-700 mt-1 transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            Hapus
          </button>
        </div>
      </div>
    )
  }

  const CheckoutCartItem = ({ item, index }) => {
    const { itemTotal, discountedPrice, discountRate } = calculateItemPrice(item)
    const animatedItemPrice = useItemPriceAnimation(discountedPrice, 400)
    const animatedOriginalPrice = useItemPriceAnimation(itemTotal, 400)

    return (
      <div key={`${item.product.id}-${item.variant.size}-${index}-${priceUpdateKey}`} 
           className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg animate-item-slide-in transition-all duration-300"
           style={{
             backgroundColor: theme === 'light' ? 'rgba(255, 247, 237, 0.3)' : 'rgba(55, 65, 81, 0.3)',
             borderColor: theme === 'light' ? 'rgba(253, 186, 116, 0.3)' : 'rgba(75, 85, 99, 0.3)'
           }}>
        {renderProductImage(
          item.product.images[0],
          item.product.name,
          "w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
        )}
        <div className="flex-1">
          <div className="font-semibold text-sm md:text-base">{item.product.name}</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Size: {item.variant.size}</div>
          <div className="flex items-center gap-2 md:gap-3 mt-2">
            <button
              onClick={() => updateQuantity(item.product.id, item.variant.size, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border rounded hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              -
            </button>
            <AnimatedQuantity quantity={item.quantity} />
            <button
              onClick={() => updateQuantity(item.product.id, item.variant.size, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border rounded hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-base md:text-lg text-orange-600 animate-price-spring">
            Rp {animatedItemPrice.toLocaleString()}
          </div>
          {discountRate > 0 && (
            <div className="text-xs text-green-600 animate-fade-in">
              Diskon {Math.round(discountRate * 100)}%
              {voucherApplied && ` (Voucher)`}
            </div>
          )}
          {discountRate > 0 && (
            <div className="text-xs text-gray-400 line-through animate-strike">
              Rp {animatedOriginalPrice.toLocaleString()}
            </div>
          )}
          <button
            onClick={() => removeFromCart(item.product.id, item.variant.size)}
            className="text-red-500 text-xs hover:text-red-700 mt-1 transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            Hapus
          </button>
        </div>
      </div>
    )
  }

const AboutPage = () => (
  <div
    className={`max-w-4xl mx-auto rounded-lg shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all duration-300 ${
      theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90 text-white'
    } ${pageTransition ? "animate-page-exit" : "animate-page-enter"}`}
  >
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-orange-700 dark:text-orange-400 mb-4 animate-fade-in-up">
        Tentang Kami
      </h1>
      <div className="w-24 h-1 bg-orange-500 mx-auto mb-6 animate-scale-in"></div>
    </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
  <div className="animate-slide-in-left">
    <h2 className="text-2xl font-semibold mb-4">Tim Kami</h2>
    <div className="space-y-3">
      {[
        { 
          name: "Darren", 
          role: "Project Manager",
          image: "https://raw.githubusercontent.com/rndmq/discord/refs/heads/main/Team/Darren.jpg" 
        },
        { 
          name: "Isabel", 
          role: "Project Manager",
          image: "https://raw.githubusercontent.com/rndmq/discord/main/Team/Isabel.jpg"
        },
        { 
          name: "Steven", 
          role: "UI Designer",
          image: "https://raw.githubusercontent.com/rndmq/discord/main/Team/-"
        },
        { 
          name: "Sultanto", 
          role: "UX Designer & Fullstack Manager",
          image: "https://raw.githubusercontent.com/rndmq/discord/main/Team/-"
        },
        { 
          name: "Anonymous", 
          role: "Tester",
          image: "https://raw.githubusercontent.com/rndmq/discord/main/Team/-"
        },
      ].map((member) => (
        <div
          key={member.name}
          className={`flex items-center gap-3 p-3 rounded-lg hover:scale-105 transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-orange-50 hover:bg-orange-100' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {/* Ganti dengan gambar */}
          <img
            src={member.image}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
            onError={(e) => {
              // Fallback ke huruf jika gambar error
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback avatar dengan huruf */}
          <div 
            className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold hidden"
          >
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{member.name}</div>
            <div className="text-sm opacity-75">{member.role}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

      <div className="animate-slide-in-right">
        <h2 className="text-2xl font-semibold mb-4">Tentang Proyek</h2>
        <div className={`p-6 rounded-lg border transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200' 
            : 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600'
        }`}>
          <p className="leading-relaxed mb-4">
            <strong>Made By Kelompok 4</strong>
          </p>
          <p className="opacity-75 leading-relaxed mb-4">
            Website ini dibuat untuk melengkapi presentasi kelompok kami tentang E-commerce bertema Hobi.
            Melalui situs ini, kami menunjukkan contoh implementasi nyata dari konsep promosi digital.
          </p>
          <div className="flex items-center gap-2 text-sm opacity-75">
            <span>⚡</span>
            <span>Dibuat dengan React.js & Next.js</span>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t pt-8 animate-fade-in-up-delayed">
      <h3 className="text-xl font-semibold text-center mb-6">Hubungi Kami</h3>
      <div className="flex flex-col sm:flex-row justify-center gap-6">

        <a
          href="https://wa.me/6285156431675"
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden flex items-center gap-3 p-4 rounded-lg hover:scale-105 transition-all duration-300 active:animate-ripple"
          style={{
            backgroundColor: theme === 'light' ? 'rgb(240, 253, 244)' : 'rgb(6, 78, 59)'
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="w-10 h-10"
          />
          <div>
            <div className="font-semibold">WhatsApp</div>
            <div className="text-sm opacity-75">+62 851-5643-1675</div>
          </div>
        </a>

        <a
          href="mailto:rndm942@yahoo.com"
          className="relative overflow-hidden flex items-center gap-3 p-4 rounded-lg hover:scale-105 transition-all duration-300 active:animate-ripple"
          style={{
            backgroundColor: theme === 'light' ? 'rgb(254, 242, 242)' : 'rgb(127, 29, 29)'
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Gmail_Icon_%282013-2020%29.svg/512px-Gmail_Icon_%282013-2020%29.svg.png"
            alt="Email"
            className="w-10 h-10"
          />
          <div>
            <div className="font-semibold">Email</div>
            <div className="text-sm opacity-75">rndm942@yahoo.com</div>
          </div>
        </a>
      </div>
    </div>

    <div className="text-center mt-8">
      <button
        onClick={() => navigateToPage("home")}
        className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold"
      >
        ← Kembali ke Menu Utama
      </button>
    </div>

    <style jsx>{`
      @keyframes ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.15);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }
      .animate-ripple {
        animation: ripple 0.4s linear;
      }
    `}</style>
  </div>
);

const Footer = () => (
  <footer className={`mt-8 py-6 border-t relative z-10 backdrop-blur-sm transition-all duration-300 ${
    theme === 'light' 
      ? 'bg-white/50 border-gray-200' 
      : 'bg-gray-900/50 border-gray-700'
  }`}>
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div 
          className="text-center cursor-pointer group"
          onClick={() => navigateToPage('about')}
        >
          <div className={`inline-block p-4 rounded-lg hover:scale-105 transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-orange-50 hover:bg-orange-100' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}>
            <div className={`text-sm mb-2 transition-colors ${
              theme === 'light' ? 'text-gray-600 group-hover:text-orange-600' : 'text-gray-400 group-hover:text-orange-400'
            }`}>
              Made by
            </div>
            <div className={`font-semibold transition-colors ${
              theme === 'light' ? 'text-orange-700 group-hover:text-orange-800' : 'text-orange-400 group-hover:text-orange-300'
            }`}>
              Kelompok 4
            </div>
            <div className={`text-xs mt-1 transition-colors ${
              theme === 'light' ? 'text-gray-500 group-hover:text-gray-600' : 'text-gray-500 group-hover:text-gray-400'
            }`}>
              Klik untuk info lebih lanjut →
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex justify-center gap-8">
            
            <a
              href="https://wa.me/6285156431675"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              style={{
                color: theme === 'light' ? '#059669' : '#34d399'
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-6 h-6"
              />
              <div className="text-left">
                <div className={`text-xs ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>WhatsApp</div>
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>0851-5643-1675</div>
              </div>
            </a>

            <a
              href="mailto:rndm942@yahoo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              style={{
                color: theme === 'light' ? '#dc2626' : '#f87171'
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Gmail_Icon_%282013-2020%29.svg/512px-Gmail_Icon_%282013-2020%29.svg.png"
                alt="Email"
                className="w-6 h-6"
              />
              <div className="text-left">
                <div className={`text-xs ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>Email</div>
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>rndm942@yahoo.com</div>
              </div>
            </a>

          </div>
        </div>
      </div>

      <div className={`text-center mt-4 pt-4 border-t ${
        theme === 'light' ? 'border-gray-200' : 'border-gray-700'
      }`}>
        <p className={`text-xs ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          © 2025 Soccer Ball Shop. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 relative overflow-hidden transition-all duration-500 ${
      theme === 'light' 
        ? 'bg-gradient-to-b from-orange-50 via-white to-amber-50' 
        : 'bg-gradient-to-b from-gray-900 via-gray-800 to-black'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'light' ? (
          <>
            <div className="absolute top-1/4 -left-10 w-20 h-20 opacity-20 animate-spin-slow">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="absolute top-10 left-10 w-8 h-8 bg-orange-400 rounded-full animate-float1 opacity-70 shadow-lg"></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-amber-500 rounded-full animate-float2 opacity-60 shadow-lg"></div>
            <div className="absolute bottom-32 left-20 w-6 h-6 bg-orange-300 rounded-full animate-float3 opacity-80 shadow-md"></div>
            <div className="absolute bottom-20 right-32 w-10 h-10 bg-red-400 rounded-full animate-float4 opacity-70 shadow-lg"></div>
            <div className="absolute top-64 left-1/4 w-7 h-7 bg-yellow-400 rounded-full animate-float5 opacity-75 shadow-md"></div>
          </>
        ) : (
          <>
            <div className="absolute top-1/4 -left-10 w-20 h-20 opacity-10 animate-spin-slow">
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full"></div>
              </div>
            </div>
            
            <div className="absolute top-10 left-10 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full animate-float1 opacity-50 shadow-lg"></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full animate-float2 opacity-40 shadow-lg"></div>
            <div className="absolute bottom-32 left-20 w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full animate-float3 opacity-60 shadow-md"></div>
            <div className="absolute bottom-20 right-32 w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full animate-float4 opacity-50 shadow-lg"></div>
            <div className="absolute top-64 left-1/4 w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full animate-float5 opacity-55 shadow-md"></div>
            
            <div className="absolute top-20 right-1/4 w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full animate-pulse-slow opacity-30"></div>
            <div className="absolute bottom-40 left-1/3 w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full animate-float3 opacity-25"></div>
          </>
        )}
      </div>

      {currentPage !== 'about' && (
        <header className={`flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-30 gap-4 md:gap-0 transition-all duration-300 ${
          theme === 'dark' ? 'text-white' : ''
        } ${pageTransition ? 'animate-page-exit' : 'animate-page-enter'}`}>
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <h1 
              className="text-xl md:text-2xl font-bold flex items-center gap-2 animate-pulse-gentle cursor-pointer transition-all duration-300"
              style={{
                color: theme === 'light' ? '#c2410c' : '#fdba74'
              }}
              onClick={() => navigateToPage('home')}
            >
              ⚽ Soccer Ball Shop - Steven
            </h1>
            
            <div className="flex items-center gap-2">
              <div 
                className={`relative w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-500 ${
                  theme === 'light' 
                    ? 'bg-gradient-to-r from-orange-400 to-amber-400' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
                onClick={toggleTheme}
              >
                <div 
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-all duration-500 ${
                    theme === 'light' 
                      ? 'left-1 translate-x-0' 
                      : 'left-7 translate-x-0'
                  }`}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {theme === 'light' ? '☀️' : '🌙'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:hidden relative">
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="cart-icon p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 relative shadow-lg z-40"
              >
                <span className="text-lg">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-cart-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {currentPage === 'home' && (
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}>
                🔍
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className={`relative w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-500 ${
                  theme === 'light' 
                    ? 'bg-gradient-to-r from-orange-400 to-amber-400' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
                onClick={toggleTheme}
              >
                <div 
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-all duration-500 ${
                    theme === 'light' 
                      ? 'left-1 translate-x-0' 
                      : 'left-7 translate-x-0'
                  }`}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {theme === 'light' ? '☀️' : '🌙'}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="cart-icon p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 relative shadow-lg z-40 transform hover:scale-105 active:scale-95"
              >
                <span className="text-lg">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-cart-bounce">
                    <AnimatedQuantity quantity={totalItems} />
                  </span>
                )}
              </button>

              {cartOpen && (
                <div
                  className={`cart-container fixed md:absolute right-1/2 md:right-0 top-16 md:top-14 w-[92vw] sm:w-80 md:w-96 rounded-lg shadow-2xl border z-50 max-h-[70vh] overflow-y-auto animate-dropdown
                             md:translate-x-[calc(50%-1rem)] md:translate-y-0 transition-all duration-300 ${
                               theme === 'light' 
                                 ? 'bg-white border-orange-100' 
                                 : 'bg-gray-800 border-gray-700'
                             }`}
                >
                  <div className="p-4">
                    <h3 className={`font-semibold mb-3 text-lg flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : ''
                    }`}>
                      🛒 Keranjang Belanja
                    </h3>
                                  
                  {cart.length === 0 ? (
                    <p className={`text-center py-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Keranjang kosong</p>
                  ) : (
                    <>
                      <div className="max-h-48 overflow-y-auto">
                        {cart.map((item, index) => (
                          <CartItemWithAnimation key={`${item.product.id}-${item.variant.size}-${index}`} item={item} index={index} />
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t" style={{
                        borderColor: theme === 'light' ? 'rgba(253, 186, 116, 0.3)' : 'rgba(75, 85, 99, 0.3)'
                      }}>
                        <div className={`flex justify-between font-semibold text-lg ${
                          theme === 'dark' ? 'text-white' : ''
                        }`}>
                          <span>Total:</span>
                          <span className="text-orange-600 animate-price-spring">Rp {animatedTotalPrice.toLocaleString()}</span>
                        </div>
                        {voucherApplied && (
                          <div className="text-sm text-green-600 mt-1 animate-pulse">
                            ✅ Voucher {form.code.toUpperCase()} berhasil diterapkan!
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setCartOpen(false)
                            navigateToPage('cart')
                          }}
                          className="w-full mt-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold transform hover:scale-105 active:scale-95"
                        >
                          Checkout ({cart.length} items)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    )}

    {cartOpen && currentPage !== 'about' && (
      <div className="md:hidden fixed inset-0 bg-black/50 z-40 flex items-end">
        <div className={`cart-container w-full max-h-3/4 overflow-y-auto animate-slide-up rounded-t-2xl transition-all duration-300 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold text-lg ${
                theme === 'dark' ? 'text-white' : ''
              }`}>🛒 Keranjang Belanja</h3>
              <button onClick={() => setCartOpen(false)} className={`text-2xl transition-transform duration-200 hover:scale-110 ${
                theme === 'dark' ? 'text-white' : ''
              }`}>×</button>
            </div>
            
            {cart.length === 0 ? (
              <p className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Keranjang kosong</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <CartItemWithAnimation key={`${item.product.id}-${item.variant.size}-${index}`} item={item} index={index} />
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t" style={{
                  borderColor: theme === 'light' ? 'rgba(253, 186, 116, 0.3)' : 'rgba(75, 85, 99, 0.3)'
                }}>
                  <div className={`flex justify-between font-semibold text-lg ${
                    theme === 'dark' ? 'text-white' : ''
                  }`}>
                    <span>Total:</span>
                    <span className="text-orange-600 animate-price-spring">Rp {animatedTotalPrice.toLocaleString()}</span>
                  </div>
                  {voucherApplied && (
                    <div className="text-sm text-green-600 mt-1 animate-pulse">
                      ✅ Voucher {form.code.toUpperCase()} berhasil diterapkan!
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setCartOpen(false)
                      navigateToPage('cart')
                    }}
                    className="w-full mt-3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold text-lg transform hover:scale-105 active:scale-95"
                  >
                    Checkout ({cart.length} items)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    <main className="relative z-10">
      {currentPage === 'about' && <AboutPage />}

      {currentPage === 'home' && (
        <div className={pageTransition ? 'animate-page-exit' : 'animate-page-enter'}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold mb-4 md:mb-0 ${
              theme === 'dark' ? 'text-white' : ''
            }`}>Semua Produk Bola</h2>
            
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedTag === tag
                      ? 'bg-orange-500 text-white shadow-lg animate-tag-select'
                      : theme === 'light'
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tag === 'all' ? 'Semua' : `#${tag}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`p-4 rounded-lg shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col min-h-[380px] ${
                  theme === 'light' 
                    ? 'bg-white/90' 
                    : 'bg-gray-800/90 text-white border border-gray-700'
                }`}
                onClick={() => openProductDetail(product)}
              >
                {renderProductImage(
                  product.images[0],
                  product.name,
                  "w-full h-48 object-cover rounded mb-3 transition-transform duration-300 hover:scale-105"
                )}
                
                <div className="flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className={`text-sm mt-1 line-clamp-2 flex-grow ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                  }`}>{product.description}</p>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className={`px-2 py-1 text-xs rounded ${
                          theme === 'light' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-orange-900 text-orange-300'
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="mt-2 text-lg font-bold text-orange-600 transition-all duration-300 hover:scale-105">
                    Rp {product.variants[1].price.toLocaleString()}
                  </p>
                  
                  <div className="mt-auto pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product, product.variants[1], 1)
                      }}
                      className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentPage === 'product' && selectedProduct && (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 ${
          pageTransition ? 'animate-page-exit' : 'animate-page-enter'
        }`}>
          <section className={`p-4 md:p-6 rounded-lg shadow-xl backdrop-blur-sm transition-all duration-300 ${
            theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90 text-white'
          }`}>
            <div className="relative mb-4">
              {renderProductImage(
                selectedProduct.images[currentImageIndex],
                selectedProduct.name,
                `w-full h-64 md:h-80 object-contain rounded transition-all duration-500 ${
                  imageAnim ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`
              )}
              
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange((currentImageIndex - 1 + selectedProduct.images.length) % selectedProduct.images.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 transform hover:scale-110"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleImageChange((currentImageIndex + 1) % selectedProduct.images.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 transform hover:scale-110"
                  >
                    →
                  </button>
                </>
              )}
              
              {selectedProduct.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {selectedProduct.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                        index === currentImageIndex 
                          ? 'bg-orange-500 scale-125' 
                          : theme === 'light' ? 'bg-white/70 hover:bg-white' : 'bg-gray-500 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-semibold">{selectedProduct.name}</h2>
            <p className={`mt-2 text-sm md:text-base ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>{selectedProduct.description}</p>
            
            {selectedProduct.tags && selectedProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedProduct.tags.map(tag => (
                  <span key={tag} className={`px-3 py-1 text-sm rounded-full ${
                    theme === 'light' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-orange-900 text-orange-300'
                  }`}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-4 md:mt-6">
              <h4 className="font-semibold mb-3">Pilih Size:</h4>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {selectedProduct.variants.map((variant) => (
                  <button
                    key={variant.size}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-2 md:px-4 md:py-3 border-2 rounded-lg transition-all duration-300 font-semibold text-sm md:text-base transform hover:scale-105 ${
                      selectedVariant.size === variant.size
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg animate-variant-bounce'
                        : theme === 'light'
                        ? 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:shadow-md'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-orange-500 hover:shadow-md'
                    }`}
                  >
                    {variant.size}<br/>
                    <span className="text-xs md:text-sm font-normal">
                      Rp {variant.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-4">
              <div className={`flex items-center gap-3 rounded-lg p-2 w-full sm:w-auto justify-center transition-all duration-300 ${
                theme === 'light' ? 'bg-orange-50' : 'bg-gray-700'
              }`}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 font-bold transform hover:scale-110 active:scale-95 ${
                    theme === 'light' ? 'bg-white' : 'bg-gray-600 border-gray-500'
                  }`}
                >
                  -
                </button>
                <AnimatedQuantity quantity={qty} />
                <button
                  onClick={() => setQty(qty + 1)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 font-bold transform hover:scale-110 active:scale-95 ${
                    theme === 'light' ? 'bg-white' : 'bg-gray-600 border-gray-500'
                  }`}
                >
                  +
                </button>
              </div>
              
              <button
                onClick={() => {
                  addToCart(selectedProduct, selectedVariant, qty)
                  setQty(1)
                }}
                className="w-full sm:flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold text-lg"
              >
                + Add to Cart
              </button>
            </div>

            {selectedVariant && (
              <div className={`mt-4 p-4 rounded-lg animate-price-change transition-all duration-300 ${
                theme === 'light' ? 'bg-orange-50' : 'bg-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                  }`}>Harga Total:</div>
                  <div className="text-right">
                    {discountRate > 0 && (
                      <div className="text-sm text-gray-400 line-through animate-strike">
                        Rp {priceBeforeDiscount.toLocaleString()}
                      </div>
                    )}
                    <div className="text-lg font-bold text-orange-600 animate-price-spring">
                      Rp {animatedPrice.toLocaleString()}
                    </div>
                    {discountRate > 0 && (
                      <div className="text-xs text-green-600 animate-fade-in">
                        🎉 Diskon {Math.round(discountRate * 100)}%
                        {voucherApplied && ` (Voucher: ${form.code.toUpperCase()})`}
                      </div>
                    )}
                  </div>
                </div>
                {voucherApplied && (
                  <div className="mt-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded animate-pulse">
                    ✅ Voucher berhasil diterapkan!
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigateToPage('home')}
              className={`w-full mt-4 py-2 border-2 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 font-semibold ${
                theme === 'light'
                  ? 'border-orange-500 text-orange-500 hover:bg-orange-50'
                  : 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
              }`}
            >
              ← Kembali ke Home
            </button>
          </section>

          <aside className={`p-4 md:p-6 rounded-lg shadow-xl backdrop-blur-sm transition-all duration-300 ${
            theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90 text-white'
          }`}>
            <h3 className="font-semibold text-lg mb-4">You may like this too</h3>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {getRecommendedProducts(selectedProduct).map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg p-3 border transform hover:-translate-y-1 ${
                    theme === 'light'
                      ? 'border-transparent hover:border-orange-200 bg-orange-50/50'
                      : 'border-gray-600 hover:border-orange-500 bg-gray-700/50'
                  }`}
                  onClick={() => openProductDetail(p)}
                >
                  {renderProductImage(
                    p.images[0],
                    p.name,
                    "w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg transition-transform duration-300 hover:scale-110"
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-sm md:text-base">{p.name}</div>
                    <div className={`text-xs md:text-sm transition-all duration-300 hover:scale-105 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                    }`}>
                      Rp {p.variants[1].price.toLocaleString()}
                    </div>
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags.slice(0, 2).map(tag => (
                          <span key={tag} className={`px-1 py-0.5 text-xs rounded ${
                            theme === 'light'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-orange-900 text-orange-300'
                          }`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className={`text-xs md:text-sm px-2 py-1 md:px-3 md:py-2 border rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                      theme === 'light'
                        ? 'border-orange-500 text-orange-500'
                        : 'border-orange-500 text-orange-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(p, p.variants[1], 1)
                    }}
                  >
                    + Tambah
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {currentPage === 'cart' && (
        <div className={`max-w-4xl mx-auto rounded-lg shadow-xl p-4 md:p-6 backdrop-blur-sm transition-all duration-300 ${
          theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90 text-white'
        } ${pageTransition ? 'animate-page-exit' : 'animate-page-enter'}`}>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
            🛒 Checkout
          </h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="text-6xl mb-4 animate-bounce">🛒</div>
              <p className={`text-lg mb-6 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>Keranjang Anda kosong</p>
              <button
                onClick={() => navigateToPage('home')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 text-lg font-semibold transform hover:scale-105 active:scale-95"
              >
                Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-lg mb-4">Items dalam Keranjang</h3>
                <div className="space-y-3 md:space-y-4">
                  {cart.map((item, index) => (
                    <CheckoutCartItem key={`${item.product.id}-${item.variant.size}-${index}`} item={item} index={index} />
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h3 className="font-semibold text-lg">Informasi Pelanggan</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Masukkan nomor telepon"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Alamat Lengkap *</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Masukkan alamat lengkap untuk pengiriman"
                    rows="3"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kode Diskon (Opsional)</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Masukkan kode diskon"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  {voucherApplied && (
                    <div className="text-sm text-green-600 mt-1 animate-pulse">
                      ✅ Voucher {form.code.toUpperCase()} berhasil diterapkan!
                    </div>
                  )}
                  {form.code && !voucherApplied && (
                    <div className="text-sm text-red-600 mt-1">
                      ❌ Kode voucher tidak valid
                    </div>
                  )}
                </div>

                <div className="payment-container relative">
                  <label className="block text-sm font-medium mb-2">Metode Pembayaran *</label>
                  <button
                    onClick={() => setPaymentOpen(!paymentOpen)}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex justify-between items-center transition-all duration-300 transform hover:scale-105 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <span>
                      {form.paymentMethod ? 
                        paymentMethods.find(p => p.id === form.paymentMethod)?.name : 
                        'Pilih metode pembayaran'
                      }
                    </span>
                    <span className={`transition-transform duration-300 ${paymentOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {paymentOpen && (
                    <div className={`absolute top-full left-0 right-0 border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto mt-1 animate-dropdown transition-all duration-300 ${
                      theme === 'light' 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gray-800 border-gray-600'
                    }`}>
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => {
                            setForm({ ...form, paymentMethod: method.id })
                            setPaymentOpen(false)
                          }}
                          className={`p-3 border-b cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                            form.paymentMethod === method.id 
                              ? theme === 'light'
                                ? 'bg-orange-100 border-orange-500'
                                : 'bg-orange-900 border-orange-500'
                              : theme === 'light'
                              ? 'hover:bg-orange-50 border-gray-200'
                              : 'hover:bg-gray-700 border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={method.icon}
                              alt={method.name}
                              className="w-6 h-6 object-contain"
                            />
                            <div>
                              <div className="font-semibold">{method.name}</div>
                              <div className={`text-xs ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>{method.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 animate-total-update" style={{
                  borderColor: theme === 'light' ? 'rgba(253, 186, 116, 0.3)' : 'rgba(75, 85, 99, 0.3)'
                }}>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Items:</span>
                    <span className="animate-quantity-bounce">{totalItems} items</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-2">
                    <span>Total Pembayaran:</span>
                    <span className="text-orange-600 animate-price-spring">
                      Rp {animatedTotalPrice.toLocaleString()}
                    </span>
                  </div>
                  {voucherApplied && (
                    <div className="text-sm text-green-600 mt-2 bg-green-50 p-2 rounded animate-pulse">
                      🎉 Hemat {Math.round((calculateDiscount(1, form.code) - getDiscount(1)) * 100)}% dengan voucher!
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6">
                  <button
                    onClick={() => navigateToPage('home')}
                    className={`flex-1 py-3 border-2 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 font-semibold ${
                      theme === 'light'
                        ? 'border-orange-500 text-orange-500 hover:bg-orange-50'
                        : 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={!form.name || !form.phone || !form.address || !form.paymentMethod}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg transform hover:scale-105 active:scale-95"
                  >
                    💳 Bayar Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>

    {showSuccessPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-sm p-4">
        <div className={`p-6 md:p-8 rounded-xl flex flex-col items-center gap-4 shadow-2xl animate-fadeIn border max-w-md w-full text-center transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-white border-orange-200' 
            : 'bg-gray-800 border-gray-700 text-white'
        }`}>
          <div className="text-6xl text-green-500 animate-bounce">✓</div>
          <h3 className="text-xl md:text-2xl font-semibold">Pesanan Berhasil!</h3>
          <p className={`text-sm md:text-base ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Terima kasih telah berbelanja di Soccer Ball Shop. 
            {form.paymentMethod && ` Pembayaran dengan ${paymentMethods.find(p => p.id === form.paymentMethod)?.name} berhasil. Pesananmu akan kami siapkan!`}
          </p>
          <button
            className="w-full mt-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold"
            onClick={() => {
              setShowSuccessPopup(false)
              navigateToPage('home')
              setForm({ name: '', phone: '', address: '', code: '', paymentMethod: '' })
            }}
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    )}

    {currentPage !== 'about' && <Footer />}

    <style jsx>{`
      .theme-transition * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }
      
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
      .animate-cart-bounce {
        animation: cartBounce 0.5s ease-out;
      }
      @keyframes cartBounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
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
      .animate-slide-up {
        animation: slideUp 0.3s ease-out forwards;
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      .animate-pulse-gentle {
        animation: pulseGentle 3s ease-in-out infinite;
      }
      @keyframes pulseGentle {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      .animate-pulse-slow {
        animation: pulseSlow 2s ease-in-out infinite;
      }
      @keyframes pulseSlow {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.05); }
      }
      .animate-spin-slow {
        animation: spin 20s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-price-change {
        animation: priceChange 0.5s ease-out;
      }
      @keyframes priceChange {
        0% { transform: scale(0.95); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-price-spring {
        animation: priceSpring 0.4s ease-out;
      }
      @keyframes priceSpring {
        0% { transform: scale(1); color: #ea580c; }
        50% { transform: scale(1.1); color: #dc2626; }
        100% { transform: scale(1); color: #ea580c; }
      }
      .animate-strike {
        animation: strike 0.3s ease-out;
      }
      @keyframes strike {
        0% { transform: scaleX(0); }
        100% { transform: scaleX(1); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
      .animate-fade-in-delayed {
        animation: fadeIn 1s ease-out 0.5s both;
      }
      .animate-dropdown {
        animation: dropdown 0.2s ease-out;
      }
      @keyframes dropdown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-total-update {
        animation: totalUpdate 0.3s ease-out;
      }
      @keyframes totalUpdate {
        0% { 
          background-color: ${theme === 'light' ? 'rgba(255, 247, 237, 0.5)' : 'rgba(55, 65, 81, 0.5)'}; 
        }
        100% { background-color: transparent; }
      }
      .animate-quantity-bounce {
        animation: quantityBounce 0.3s ease-out;
      }
      @keyframes quantityBounce {
        0% { transform: scale(1); color: inherit; }
        50% { transform: scale(1.3); color: #ea580c; }
        100% { transform: scale(1); color: inherit; }
      }
      .animate-item-slide-in {
        animation: itemSlideIn 0.3s ease-out;
      }
      @keyframes itemSlideIn {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .animate-variant-bounce {
        animation: variantBounce 0.3s ease-out;
      }
      @keyframes variantBounce {
        0% { transform: scale(0.95); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .animate-tag-select {
        animation: tagSelect 0.3s ease-out;
      }
      @keyframes tagSelect {
        0% { transform: scale(0.95); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .animate-page-enter {
        animation: pageEnter 0.6s ease-out forwards;
      }
      @keyframes pageEnter {
        from { 
          opacity: 0; 
          transform: scale(0.8) translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
      .animate-page-exit {
        animation: pageExit 0.3s ease-in forwards;
      }
      @keyframes pageExit {
        from { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
        to { 
          opacity: 0; 
          transform: scale(0.9) translateY(-10px); 
        }
      }
      .animate-dribble {
        animation: dribble 1s ease-in-out infinite;
      }
      @keyframes dribble {
        0% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-40px) rotate(90deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
        75% { transform: translateY(-35px) rotate(270deg); }
        100% { transform: translateY(0) rotate(360deg); }
      }
      .animate-shadow-dribble {
        animation: shadowDribble 1s ease-in-out infinite;
      }
      @keyframes shadowDribble {
        0% { transform: scale(0.8); opacity: 0.3; }
        25% { transform: scale(1.1); opacity: 0.6; }
        50% { transform: scale(0.9); opacity: 0.4; }
        75% { transform: scale(1.05); opacity: 0.5; }
        100% { transform: scale(0.8); opacity: 0.3; }
      }
      .animate-gradient-flow {
        animation: gradientFlow 3s ease-in-out infinite;
        background-size: 200% 200%;
      }
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-text-slide-up {
        animation: textSlideUp 0.8s ease-out 0.5s both;
      }
      @keyframes textSlideUp {
        from { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      .animate-text-slide-up-delayed {
        animation: textSlideUp 0.8s ease-out 1s both;
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out;
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-scale-in {
        animation: scaleIn 0.6s ease-out 0.2s both;
      }
      @keyframes scaleIn {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
      .animate-slide-in-left {
        animation: slideInLeft 0.6s ease-out;
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .animate-slide-in-right {
        animation: slideInRight 0.6s ease-out;
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .animate-fade-in-up-delayed {
        animation: fadeInUp 0.6s ease-out 0.4s both;
      }
      .clip-pentagon {
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
      }
      .clip-hexagon {
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .min-h-\[380px\] {
        min-height: 380px;
      }
      .mt-auto {
        margin-top: auto;
      }
      .product-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `}</style>
  </div>
)
}