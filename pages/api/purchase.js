import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_PATH, 'purchases.json')

function ensure(){
  if(!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH)
  if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ purchases: [] }, null, 2))
}

export default function handler(req, res){
  ensure()
  if(req.method === 'GET'){
    const raw = fs.readFileSync(FILE, 'utf8')
    const json = JSON.parse(raw)
    return res.status(200).json(json)
  }
  if(req.method === 'POST'){
    const body = req.body
    const raw = fs.readFileSync(FILE, 'utf8')
    const json = JSON.parse(raw)
    const purchase = {
      id: 'p_' + Date.now(),
      productId: body.productId,
      name: body.name,
      phone: body.phone,
      address: body.address,
      size: body.size,
      price: body.price,
      qty: body.qty,
      createdAt: new Date().toISOString()
    }
    json.purchases.unshift(purchase)
    fs.writeFileSync(FILE, JSON.stringify(json, null, 2))
    return res.status(201).json({ ok:true, purchase })
  }
  res.status(405).end()
}
