// app/api/purchase/route.js
import { supabase } from '../../lib/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ 
        error: error.message,
        purchases: [] 
      }, { status: 500 })
    }

    console.log('Fetched purchases:', data?.length || 0)
    return Response.json({ 
      purchases: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Server error:', error)
    return Response.json({ 
      error: 'Internal server error',
      purchases: [] 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { productId, size, price, qty, name, phone, address, product_name } = await request.json()
    
    const { data, error } = await supabase
      .from('purchases')
      .insert([{ 
        product_id: productId,
        product_name: product_name,
        size, 
        price, 
        qty, 
        name, 
        phone, 
        address 
      }])
      .select()

    if (error) {
      console.error('Insert error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ 
      success: true, 
      data: data[0] 
    })
  } catch (error) {
    console.error('Server error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
