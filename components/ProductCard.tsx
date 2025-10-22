"use client";
import { useState, useEffect } from "react";

export default function ProductCard({ product }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [product.images.length]);

  return (
    <div className="rounded-2xl shadow-md p-4">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={product.images[current]}
          alt={product.name}
          className="w-full h-64 object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 flex justify-between items-center px-2">
          <button onClick={() => setCurrent((current - 1 + product.images.length) % product.images.length)}>◀</button>
          <button onClick={() => setCurrent((current + 1) % product.images.length)}>▶</button>
        </div>
      </div>
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-500">{product.price}</p>
    </div>
  );
}
