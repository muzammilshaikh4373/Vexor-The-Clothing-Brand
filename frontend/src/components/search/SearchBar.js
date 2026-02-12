import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/products', {
          params: { limit: 5 },
        });
        
        const filtered = response.data.products.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none"
          />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.slug)}
                  className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-sm"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{product.category}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.discount_price ? (
                        <>
                          <span className="font-bold text-accent">₹{product.discount_price}</span>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.price}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center text-gray-500">No products found</div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Start typing to search products...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};