import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface CartItem {
    id: string;
    product_id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant_id?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, variantId?: string) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, delta: number) => Promise<void>;
    clearCart: () => void;
    total: number;
    count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        if (user) fetchCart();
        else {
            const saved = localStorage.getItem('cart');
            if (saved) setItems(JSON.parse(saved));
        }
    }, [user]);

    useEffect(() => {
        if (!user) localStorage.setItem('cart', JSON.stringify(items));
    }, [items, user]);

    const fetchCart = async () => {
        const { data } = await supabase
            .from('cart_items')
            .select(`
                id,
                quantity,
                variant_id,
                product:products (id, name, price, image)
            `)
            .eq('user_id', user?.id);

        if (data) {
            const formatted: CartItem[] = data.map((item: any) => ({
                id: item.id,
                product_id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity,
                variant_id: item.variant_id
            }));
            setItems(formatted);
        }
    };

    const addToCart = async (product: any, variantId?: string) => {
        if (user) {
            const { error } = await supabase.from('cart_items').insert([
                { user_id: user.id, product_id: product.id, variant_id: variantId, quantity: 1 }
            ]);
            if (!error) fetchCart();
        } else {
            setItems(prev => {
                const existing = prev.find(item => item.product_id === product.id && item.variant_id === variantId);
                if (existing) {
                    return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                }
                return [...prev, { ...product, product_id: product.id, quantity: 1, variant_id: variantId }];
            });
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (user) {
            await supabase.from('cart_items').delete().eq('id', itemId);
            fetchCart();
        } else {
            setItems(prev => prev.filter(item => item.id !== itemId));
        }
    };

    const updateQuantity = async (itemId: string, delta: number) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQty = Math.max(1, item.quantity + delta);

        if (user) {
            await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId);
            fetchCart();
        } else {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
        }
    };

    const clearCart = () => {
        setItems([]);
        if (!user) localStorage.removeItem('cart');
    };

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const count = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within a CartProvider');
    return context;
};
