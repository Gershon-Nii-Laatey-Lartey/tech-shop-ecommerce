import { motion } from 'framer-motion';
import { Package, Edit2, Trash2, Plus } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    productName: string;
    timestamp: string;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
        case 'create':
            return <Plus size={14} />;
        case 'update':
            return <Edit2 size={14} />;
        case 'delete':
            return <Trash2 size={14} />;
    }
};

const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
        case 'create':
            return { bg: 'rgba(74, 222, 128, 0.15)', color: '#22c55e' };
        case 'update':
            return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
        case 'delete':
            return { bg: 'rgba(255, 68, 68, 0.15)', color: '#ef4444' };
    }
};

const getActivityLabel = (type: ActivityItem['type']) => {
    switch (type) {
        case 'create':
            return 'Product added';
        case 'update':
            return 'Product updated';
        case 'delete':
            return 'Product removed';
    }
};

const RecentActivity = ({ activities }: RecentActivityProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #f0f0f0',
                padding: '28px',
                height: '100%'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>Recent Activity</h3>
                <Package size={18} style={{ color: '#888' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '40px 0' }}>
                        No recent activity
                    </p>
                ) : (
                    activities.map((activity, index) => {
                        const colors = getActivityColor(activity.type);
                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px',
                                    background: '#f9f9fb',
                                    borderRadius: '14px'
                                }}
                            >
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        background: colors.bg,
                                        color: colors.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>
                                        {activity.productName}
                                    </p>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>
                                        {getActivityLabel(activity.type)}
                                    </p>
                                </div>
                                <p style={{ fontSize: '10px', fontWeight: 600, color: '#aaa' }}>
                                    {activity.timestamp}
                                </p>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default RecentActivity;
