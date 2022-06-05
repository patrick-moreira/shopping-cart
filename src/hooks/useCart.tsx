import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // TODO
    const cartStorage = localStorage.getItem('@RocketShoes:cart');
    
    if (cartStorage) {
      return JSON.parse(cartStorage);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO

      const responseStock = await api.get<Stock>(`/stock/${productId}`);
      const stock = responseStock.data;

      const productExists = cart.find((item) => item.id === productId);
      
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const responseProduct = await api.get<Product>(`/products/${productId}`);
      const product = responseProduct.data;

      const newCart = !productExists ? [...cart, { ...product, amount }] :
        cart.map((item) => item.id === productId ? {...item, amount } : {...item}); 
  
      setCart([...newCart]);
      
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productExists = cart.find((item) => item.id === productId);
      
      if (!productExists) {
        toast.error('Erro na remoção do produto');
        return;
      }
      
      const cartFiltered = cart.filter((item) => item.id !== productId)
      setCart([...cartFiltered]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartFiltered));
      
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) return;
      
      const responseStock = await api.get<Stock>(`/stock/${productId}`);
      const stock = responseStock.data;

      if (stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const cartUpdated = cart.map((item) => item.id === productId ?  {...item, amount} : {...item}); 
      setCart([...cartUpdated]);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdated));

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
