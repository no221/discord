import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productId, size, price, qty, name, phone, address } = req.body;
    const { error } = await supabase
      .from('purchases')
      .insert([{ productId, size, price, qty, name, phone, address }]);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('purchases').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ purchases: data });
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
