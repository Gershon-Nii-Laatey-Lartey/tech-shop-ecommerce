import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotFound from '../pages/NotFound';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8FAFC'
            }}>
                <div style={{ color: '#64748B', fontWeight: 600 }}>Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return <NotFound />;
    }

    return <>{children}</>;
};

export default AdminRoute;
