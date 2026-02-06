import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
}

interface CategoryContextType {
    categories: Category[];
    loading: boolean;
    refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, loading, refreshCategories: fetchCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};
