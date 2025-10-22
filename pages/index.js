import { useState, useEffect } from 'react'

const PRODUCTS = [
  { id: 'futsal-1', name: 'Bola Futsal Pro', img: '/futsal.jpg', variants: [{size:4,price:199000},{size:5,price:249000},{size:6,price:299000}] },
  { id: 'soccer-1', name: 'Bola Sepak Classic', img: '/soccer.jpg', variants: [{size:4,price:159000},{size:5,price:209000},{size:6,price:259000}] },
  { id: 'mini-1', name: 'Bola Training', img: '/mini.jpg', variants: [{size:4,price:99000},{size:5,price:129000},{size:6,price:149000}] }
]

export default function Home(){
  const [cartOpen,setCartOpen] = useState(false)
  const [selected, setSelected] = useState({product: PRODUCTS[0], variant: PRODUCTS[0].variants[1]})
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({name:'John Doe', phone:'081234567890', address:'Jl. Contoh 1'})
  const [status, setStatus] = useState(null)

  useEffect(()=>{
    // default variant
    setSelected({product:PRODUCTS[0], variant:PRODUCTS[0].variants[1]})
  },[])

  function openCartFor(product){
    setSelected({product, variant: product.variants[1]})
    setQty(1)
    setCartOpen(true)
  }

  async function bayarNow(){
    // show immediate success and call backend
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
    try{
      const res = await fetch('/api/purchase', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body)})
      const json = await res.json()
      setStatus('success')
      // you may redirect or clear cart
    }catch(e){
      console.error(e)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mi Store - Clone</h1>
        <a href="/admin" className="text-sm underline">Admin Panel</a>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-4 rounded-lg shadow">
          <img src={selected.product.img} alt="product" className="w-full h-64 object-contain"/>
          <h2 className="mt-3 text-xl font-semibold">{selected.product.name}</h2>
          <p className="text-lg mt-2">Rp {selected.variant.price.toLocaleString()}</p>
          <div className="mt-4">
            <button onClick={()=>openCartFor(selected.product)} className="px-4 py-2 rounded bg-orange-500 text-white">Beli Sekarang</button>
          </div>
        </section>

        <aside className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">You may like this too</h3>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {PRODUCTS.map(p=> (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.img} alt="thumb" className="w-16 h-16 object-cover rounded"/>
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">Rp {p.variants[1].price.toLocaleString()}</div>
                </div>
                <button onClick={()=>openCartFor(p)} className="text-sm px-3 py-1 border rounded">Tambah</button>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {/* Cart popup */}
      <div className={`fixed left-0 right-0 bottom-0 transition-transform ${cartOpen? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-t-xl shadow-lg">
          <div className="flex items-start gap-4">
            <img src={selected.product.img} alt="small" className="w-20 h-20 object-cover rounded"/>
            <div className="flex-1">
              <div className="font-semibold">{selected.product.name}</div>
              <div className="text-sm mt-2">Variants</div>
              <table className="w-full mt-2 text-sm">
                <thead>
                  <tr className="text-left"><th>Size</th><th>Price</th><th></th></tr>
                </thead>
                <tbody>
                  {selected.product.variants.map(v=> (
                    <tr key={v.size} className={`cursor-pointer ${selected.variant.size===v.size? 'bg-gray-100':''}`} onClick={()=>setSelected({...selected, variant:v})}>
                      <td className="py-2">{v.size}</td>
                      <td>Rp {v.price.toLocaleString()}</td>
                      <td>{selected.variant.size===v.size? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3">
                <label className="block text-xs">Nama</label>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2 rounded text-sm" />
                <label className="block text-xs mt-2">No. Telp</label>
                <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="w-full border p-2 rounded text-sm" />
                <label className="block text-xs mt-2">Alamat</label>
                <input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="w-full border p-2 rounded text-sm" />
                <div className="text-xs text-gray-500 mt-1">*don't use your actuall information*</div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-sm">Quantity</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={()=>setQty(Math.max(1,qty-1))} className="px-2 border rounded">-</button>
                    <div>{qty}</div>
                    <button onClick={()=>setQty(qty+1)} className="px-2 border rounded">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Total</div>
                  <div className="text-lg font-bold">Rp {(selected.variant.price * qty).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={()=>{setCartOpen(false)}} className="flex-1 py-2 border rounded">Tutup</button>
                <button onClick={bayarNow} className="flex-1 py-2 rounded bg-emerald-600 text-white">Bayar Sekarang</button>
              </div>

              {status==='success' && <div className="mt-3 text-green-600">Pembelian berhasil! Terima kasih.</div>}
              {status==='processing' && <div className="mt-3 text-gray-600">Memproses...</div>}
              {status==='error' && <div className="mt-3 text-red-600">Ada kesalahan. coba lagi.</div>}

            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
