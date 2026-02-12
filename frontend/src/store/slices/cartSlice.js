import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    const cart = localStorage.getItem('vexor_cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem('vexor_cart', JSON.stringify(cart));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    isOpen: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, variant, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id && 
                  item.variant.size === variant.size && 
                  item.variant.color === variant.color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, variant, quantity });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => !(item.product.id === action.payload.productId && 
                    item.variant.size === action.payload.variantSize &&
                    item.variant.color === action.payload.variantColor)
      );
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, variantSize, variantColor, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.product.id === productId && 
                  item.variant.size === variantSize &&
                  item.variant.color === variantColor
      );
      if (item) {
        item.quantity = quantity;
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  toggleCart,
  openCart,
  closeCart 
} = cartSlice.actions;

export default cartSlice.reducer;