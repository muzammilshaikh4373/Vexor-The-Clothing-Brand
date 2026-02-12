import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import api from '../utils/api';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 0 });

  const currentCategory = searchParams.get('category') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          sort_by: currentSort,
        };
        if (currentCategory) {
          params.category = currentCategory;
        }

        const response = await api.get('/products', { params });
        setProducts(response.data.products);
        setPagination({
          page: response.data.page,
          total_pages: response.data.total_pages,
        });
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentSort, currentPage]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div data-testid="shop-page" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-6xl tracking-tight uppercase mb-4">
            Shop All
          </h1>
          <p className="text-gray-600">Premium street & fitness wear</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-widest text-sm">Filters:</span>
          </div>

          {/* Category Filter */}
          <Select value={currentCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger data-testid="category-filter" className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger data-testid="sort-filter" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>

          {currentCategory && (
            <Button
              data-testid="clear-filters-button"
              variant="ghost"
              onClick={() => handleCategoryChange('')}
              className="text-sm"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div data-testid="loading-spinner" className="text-center py-24">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div data-testid="no-products" className="text-center py-24">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <>
            <div data-testid="products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  data-testid="prev-page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                <span className="mx-4 text-sm">
                  Page {currentPage} of {pagination.total_pages}
                </span>
                <Button
                  data-testid="next-page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total_pages}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};