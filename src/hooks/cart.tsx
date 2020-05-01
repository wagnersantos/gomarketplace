import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLocal = await AsyncStorage.getItem('@GMP:products');
      const parsedProducts = productsLocal ? JSON.parse(productsLocal) : [];
      setProducts(parsedProducts);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex === -1) {
        const obj = [
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ];
        setProducts(obj);
        await AsyncStorage.setItem('@GMP:products', JSON.stringify(obj));

        return;
      }

      const incrementProducts = products.map(item => {
        if (item.id === product.id) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });

      setProducts(incrementProducts);
      await AsyncStorage.setItem(
        '@GMP:products',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProduct = products.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });

      setProducts(incrementProduct);
      await AsyncStorage.setItem(
        '@GMP:products',
        JSON.stringify(incrementProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProduct = products.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }
        return item;
      });
      setProducts(decrementProduct);
      await AsyncStorage.setItem(
        '@GMP:products',
        JSON.stringify(decrementProduct),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
