
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { orderId, rating } = req.body;
    if (!orderId || !rating) {
      return res.status(400).json({ error: 'Missing orderId or rating' });
    }

    const { error } = await supabase
      .from('ratings')
      .insert([{ orderId, rating }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end();
}
