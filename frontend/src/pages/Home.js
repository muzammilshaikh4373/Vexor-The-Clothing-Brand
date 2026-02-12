import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { ArrowRight, Truck, Shield, Zap } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/button';
import api from '../utils/api';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products/featured');
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div data-testid="home-page" className="font-body">
      {/* Marquee */}
      <div className="bg-accent text-white py-2">
        <Marquee speed={50}>
          <span className="text-xs uppercase tracking-[0.3em] font-bold mx-8">
            New Arrivals
          </span>
          <span className="text-xs uppercase tracking-[0.3em] font-bold mx-8">
            Free Shipping Over ₹2999
          </span>
          <span className="text-xs uppercase tracking-[0.3em] font-bold mx-8">
            Built for Those Who Move Different
          </span>
          <span className="text-xs uppercase tracking-[0.3em] font-bold mx-8">
            New Arrivals
          </span>
          <span className="text-xs uppercase tracking-[0.3em] font-bold mx-8">
            Free Shipping Over ₹2999
          </span>
        </Marquee>
      </div>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1647768617268-06697e8a91d4?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-heading text-6xl md:text-8xl tracking-tighter uppercase leading-none mb-6"
          >
            BUILT FOR
            <br />
            THE GRIND
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl tracking-wide mb-8 max-w-xl mx-auto"
          >
            Premium street & fitness wear for those who move different
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              data-testid="shop-now-button"
              onClick={() => navigate('/shop')}
              className="h-14 px-12 rounded-none text-sm uppercase tracking-widest font-bold"
            >
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Truck className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold uppercase tracking-widest mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders over ₹2999</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold uppercase tracking-widest mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold uppercase tracking-widest mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">2-5 business days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section data-testid="featured-products" className="py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-6xl tracking-tight uppercase mb-4">
              New Drops
            </h2>
            <p className="text-lg text-gray-600">Gear built for performance and style</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              data-testid="view-all-button"
              onClick={() => navigate('/shop')}
              variant="secondary"
              className="h-12 px-8 rounded-none uppercase tracking-widest"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1760050516414-86ef5b0c424d?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="font-heading text-5xl md:text-7xl tracking-tighter uppercase mb-6">
            JOIN THE MOVEMENT
          </h2>
          <Button
            onClick={() => navigate('/shop')}
            variant="secondary"
            className="h-14 px-12 rounded-none uppercase tracking-widest"
          >
            Explore Collection
          </Button>
        </div>
      </section>
    </div>
  );
};