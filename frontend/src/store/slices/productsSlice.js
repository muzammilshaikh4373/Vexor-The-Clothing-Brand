import { createSlice } from '@reduxjs/toolkit';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    featuredProducts: [],
    categories: [],
    filters: {
      category: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'newest',
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload.products;
      state.pagination = {
        page: action.payload.page,
        limit: action.payload.limit,
        total: action.payload.total,
        totalPages: action.payload.total_pages,
      };
    },
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: null,
        minPrice: null,
        maxPrice: null,
        sortBy: 'newest',
      };
    },
  },
});

export const { 
  setProducts, 
  setFeaturedProducts, 
  setCategories, 
  setFilters, 
  resetFilters 
} = productsSlice.actions;

export default productsSlice.reducer;