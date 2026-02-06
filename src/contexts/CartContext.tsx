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
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, delta: number) => Promise<void>;
    clearCart: () => Promise<void>;
    total: number;
    count: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Fetch cart items from database
    const fetchCartItems = async () => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        try {
            const { data: cartData, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    product_id,
                    quantity,
                    products (
                        name,
                        price,
                        image
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            const formattedItems: CartItem[] = (cartData || []).map((item: any) => ({
                id: item.id,
                product_id: item.product_id,
                name: item.products.name,
                price: parseFloat(item.products.price),
                image: item.products.image,
                quantity: item.quantity
            }));

            setItems(formattedItems);
        } catch (error) {
            console.error('Error fetching cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load cart when user changes
    useEffect(() => {
        fetchCartItems();
    }, [user]);

    const addToCart = async (product: any) => {
        if (!user) {
            alert('Please sign in to add items to cart');
            return;
        }

        const qtyToAdd = product.quantity || 1;

        try {
            // Check if item already exists
            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.id)
                .single();

            if (existing) {
                // Update quantity
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + qtyToAdd })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Insert new item
                const { error } = await supabase
                    .from('cart_items')
                    .insert([{
                        user_id: user.id,
                        product_id: product.id,
                        quantity: qtyToAdd
                    }]);

                if (error) throw error;
            }

            await fetchCartItems();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', itemId)
                .eq('user_id', user.id);

            if (error) throw error;
            await fetchCartItems();
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    const updateQuantity = async (itemId: string, delta: number) => {
        if (!user) return;

        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            await removeFromCart(itemId);
            return;
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', itemId)
                .eq('user_id', user.id);

            if (error) throw error;
            await fetchCartItems();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const clearCart = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            setItems([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
