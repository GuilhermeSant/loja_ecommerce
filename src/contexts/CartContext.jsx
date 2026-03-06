import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'loja_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(
        (i) => i.productId === action.item.productId && i.size === action.item.size && i.color === action.item.color
      );
      let next;
      if (existing) {
        next = state.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + (action.item.quantity || 1) } : i
        );
      } else {
        next = [...state, { ...action.item, quantity: action.item.quantity || 1 }];
      }
      saveCart(next);
      return next;
    }
    case 'REMOVE': {
      const next = state.filter(
        (i) =>
          !(
            i.productId === action.productId &&
            (action.size == null || i.size === action.size) &&
            (action.color == null || i.color === action.color)
          )
      );
      saveCart(next);
      return next;
    }
    case 'SET_QUANTITY': {
      const next = state.map((i) => {
        if (
          i.productId === action.productId &&
          i.size === action.size &&
          i.color === action.color
        ) {
          const q = Math.max(0, action.quantity);
          return q === 0 ? null : { ...i, quantity: q };
        }
        return i;
      }).filter(Boolean);
      saveCart(next);
      return next;
    }
    case 'CLEAR':
      saveCart([]);
      return [];
    default:
      return state;
  }
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], () => loadCart());

  const addItem = (item) => dispatch({ type: 'ADD', item });
  const removeItem = (productId, size, color) =>
    dispatch({ type: 'REMOVE', productId, size, color });
  const setQuantity = (productId, size, color, quantity) =>
    dispatch({ type: 'SET_QUANTITY', productId, size, color, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, setQuantity, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}
