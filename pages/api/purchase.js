// pages/api/purchase.js
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  console.log('Purchase API called:', req.method)
  
  if (req.method === 'GET') {
    try {
      console.log('Fetching purchases from Supabase...')
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ 
          error: error.message,
          purchases: [] 
        })
      }

      console.log('Successfully fetched purchases:', data?.length || 0)
      return res.status(200).json({ 
        purchases: data || [],
        count: data?.length || 0
      })
      
    } catch (error) {
      console.error('Server error:', error)
      return res.status(500).json({ 
        error: 'Internal server error: ' + error.message,
        purchases: [] 
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        productId, 
        size, 
        price, 
        qty, 
        name, 
        phone, 
        address, 
        product_name,
        voucher_code, 
        discount_rate, 
        final_price,
        paymentMethod // ✅ TAMBAH INI
      } = req.body
      
      console.log('Creating purchase:', { 
        productId, 
        product_name, 
        size, 
        price, 
        qty, 
        name,
        voucher_code,
        discount_rate,
        final_price,
        paymentMethod // ✅ TAMBAH INI
      })

      // Validasi field required
      if (!productId || !name || !phone || !address) {
        return res.status(400).json({ 
          error: 'Missing required fields: productId, name, phone, address' 
        })
      }

      const { data, error } = await supabase
        .from('purchases')
        .insert([{ 
          product_id: productId,
          product_name: product_name || '',
          size: size || '', 
          price: price || 0, 
          qty: qty || 1, 
          name, 
          phone, 
          address,
          voucher_code: voucher_code || null,
          discount_rate: discount_rate || 0,  
          final_price: final_price || price,
          payment_method: paymentMethod || '', // ✅ TAMBAH INI
          created_at: new Date().toISOString() // ✅ TIMESTAMP AUTO
        }])
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        return res.status(500).json({ 
          error: 'Database error: ' + error.message 
        })
      }

      console.log('Purchase created successfully:', data[0])
      return res.status(200).json({ 
        success: true, 
        data: data[0] 
      })
      
    } catch (error) {
      console.error('Server error:', error)
      return res.status(500).json({ 
        error: 'Internal server error: ' + error.message 
      })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
        }
