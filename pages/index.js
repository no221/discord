import { useState, useEffect } from 'react'

const PRODUCTS = [
  { id: 'futsal-1', name: 'Bola Futsal Pro', img: '/futsal.jpg', variants: [{size:4,price:199000},{size:5,price:249000},{size:6,price:299000}] },
  { id: 'soccer-1', name: 'Bola Sepak Classic', img: '/soccer.jpg', variants: [{size:4,price:159000},{size:5,price:209000},{size:6,price:259000}] },
  { id: 'mini-1', name: 'Bola Training', img: '/mini.jpg', variants: [{size:4,price:99000},{size:5,price:129000},{size:6,price:149000}] }
