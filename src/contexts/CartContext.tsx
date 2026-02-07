import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export interface CartItem {
    id: string;
    product_id: string;
    variant_id?: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    weight: number;
    variant_name?: string;
}

interface CartContextType {
    items: CartItem[];
    selectedItems: CartItem[];
    addToCart: (product: any) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, delta: number) => Promise<void>;
    clearCart: () => Promise<void>;
    total: number;
    count: number;
    selectedIds: string[];
    toggleSelection: (itemId: string) => void;
    toggleSelectAll: () => void;
    loading: boolean;
    showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const { user } = useAuth();

    // Fetch cart items from database or local storage
    const fetchCartItems = async () => {
        if (!user) {
            const guestCart = localStorage.getItem('guest_cart');
            if (guestCart) {
                setItems(JSON.parse(guestCart));
            } else {
                setItems([]);
            }
            setLoading(false);
            return;
        }

        try {
            const { data: cartData, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    product_id,
                    variant_id,
                    quantity,
                    products (
                        *
                    ),
                    product_variants (
                        name,
                        value,
                        price_modifier
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            const formattedItems: CartItem[] = (cartData || [])
                .filter((item: any) => item.products)
                .map((item: any) => {
                    const basePrice = parseFloat(item.products.price || '0');
                    const modifier = item.product_variants ? parseFloat(item.product_variants.price_modifier) : 0;

                    return {
                        id: item.id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        name: item.products.name || 'Unknown Product',
                        price: basePrice + modifier,
                        image: item.products.image || '',
                        quantity: item.quantity,
                        weight: parseFloat(item.products.weight || '0.5'),
                        variant_name: item.product_variants ? `${item.product_variants.name}: ${item.product_variants.value}` : undefined
                    };
                });

            setItems(prevItems => {
                const newItemIds = formattedItems.map(i => i.id);
                setSelectedIds(prevSelected => {
                    if (prevSelected.length === 0 && prevItems.length === 0) return newItemIds;
                    const stillExists = prevSelected.filter(id => newItemIds.includes(id));
                    const newAdds = newItemIds.filter(id => !prevItems.some(old => old.id === id));
                    return Array.from(new Set([...stillExists, ...newAdds]));
                });
                return formattedItems;
            });
        } catch (error) {
            console.error('Error fetching cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load cart when user changes
    useEffect(() => {
        const initCart = async () => {
            if (user) {
                // Merge guest cart with user cart if exists
                const guestCartStr = localStorage.getItem('guest_cart');
                if (guestCartStr) {
                    const guestItems = JSON.parse(guestCartStr) as CartItem[];
                    if (guestItems.length > 0) {
                        for (const item of guestItems) {
                            await syncItemToDb(item, user.id);
                        }
                        localStorage.removeItem('guest_cart');
                    }
                }
            }
            fetchCartItems();
        };
        initCart();
    }, [user]);

    const syncItemToDb = async (item: CartItem, userId: string) => {
        const { data: existing } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', item.product_id)
            .eq('variant_id', item.variant_id || null)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + item.quantity })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('cart_items')
                .insert([{
                    user_id: userId,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity
                }]);
        }
    };

    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const addToCart = async (product: any) => {
        const qtyToAdd = product.quantity || 1;
        const variantId = product.variant_id || null;

        if (!user) {
            // Guest mode
            const guestItems = [...items];
            const existingIndex = guestItems.findIndex(i =>
                i.product_id === product.id && i.variant_id === variantId
            );

            if (existingIndex > -1) {
                guestItems[existingIndex].quantity += qtyToAdd;
            } else {
                guestItems.push({
                    id: `guest-${Date.now()}-${Math.random()}`,
                    product_id: product.id,
                    variant_id: variantId,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: qtyToAdd,
                    weight: product.weight || 0.5,
                    variant_name: product.variant_name
                });
            }
            localStorage.setItem('guest_cart', JSON.stringify(guestItems));
            setItems(guestItems);
            showToast(`Added to cart`);
            return;
        }

        try {
            // User mode
            let query = supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.id);

            if (variantId) {
                query = query.eq('variant_id', variantId);
            } else {
                query = query.is('variant_id', null);
            }

            const { data: existing } = await query.maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + qtyToAdd })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('cart_items')
                    .insert([{
                        user_id: user.id,
                        product_id: product.id,
                        variant_id: variantId,
                        quantity: qtyToAdd
                    }]);
                if (error) throw error;
            }

            await fetchCartItems();
            showToast(`Added to cart`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (!user) {
            const guestItems = items.filter(i => i.id !== itemId);
            localStorage.setItem('guest_cart', JSON.stringify(guestItems));
            setItems(guestItems);
            return;
        }

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
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            await removeFromCart(itemId);
            return;
        }

        if (!user) {
            const guestItems = items.map(i =>
                i.id === itemId ? { ...i, quantity: newQty } : i
            );
            localStorage.setItem('guest_cart', JSON.stringify(guestItems));
            setItems(guestItems);
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
        if (!user) {
            localStorage.removeItem('guest_cart');
            setItems([]);
            return;
        }

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

    const toggleSelection = (itemId: string) => {
        setSelectedIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(i => i.id));
        }
    };

    const total = items
        .filter(item => selectedIds.includes(item.id))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items
        .filter(item => selectedIds.includes(item.id))
        .reduce((sum, item) => sum + item.quantity, 0);

    const selectedItems = items.filter(item => selectedIds.includes(item.id));

    return (
        <CartContext.Provider value={{
            items, selectedItems, addToCart, removeFromCart, updateQuantity, clearCart,
            total, count, selectedIds, toggleSelection, toggleSelectAll,
            loading, showToast
        }}>
            {children}

            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '32px',
                            left: '32px',
                            zIndex: 9999,
                            background: '#fff',
                            color: '#0F172A',
                            padding: '12px 20px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid #F1F5F9',
                            pointerEvents: 'none'
                        }}
                    >
                        <ShoppingBag size={16} color="#5544ff" />
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
