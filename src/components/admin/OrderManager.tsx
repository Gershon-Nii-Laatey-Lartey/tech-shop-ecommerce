import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, Check, Clock, AlertCircle, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Order {
    id: string;
    user_id: string;
    status: string;
    total: number;
    created_at: string;
    updated_at: string;
    tracking_number?: string;
    payment_status?: string;
    shipping_address: {
        firstName: string;
        lastName: string;
        city: string;
        state: string;
        email?: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#f59e0b';
        case 'processing': return '#3b82f6';
        case 'shipped': return '#8b5cf6';
        case 'delivered': return '#10b981';
        case 'cancelled': return '#ef4444';
        default: return '#888';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending': return <Clock size={16} />;
        case 'processing': return <Package size={16} />;
        case 'shipped': return <Truck size={16} />;
        case 'delivered': return <Check size={16} />;
        case 'cancelled': return <AlertCircle size={16} />;
        default: return <Clock size={16} />;
    }
};

const OrderManager = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setOrders(data);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        }
    };

    const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ tracking_number: trackingNumber })
            .eq('id', orderId);

        if (!error) {
            fetchOrders();
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shipping_address?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shipping_address?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>Orders</h1>
                <p style={{ color: '#888', fontWeight: 600 }}>Manage and track customer orders</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#aaa' }} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: statusFilter === status ? 'none' : '1px solid #eee',
                                background: statusFilter === status ? 'black' : 'white',
                                color: statusFilter === status ? 'white' : '#666',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textTransform: 'capitalize'
                            }}
                        >
                            {status}
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: statusFilter === status ? 'rgba(255,255,255,0.2)' : '#f5f5f7',
                                fontSize: '12px'
                            }}>
                                {statusCounts[status as keyof typeof statusCounts]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: '#f9f9fb', borderRadius: '24px' }}>
                    <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No Orders Found</h3>
                    <p style={{ color: '#888' }}>No orders match your current filters</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 400px' : '1fr', gap: '24px' }}>
                    {/* Orders List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredOrders.map((order, idx) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                    background: selectedOrder?.id === order.id ? '#f9f9fb' : 'white',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: selectedOrder?.id === order.id ? '2px solid #333' : '1px solid #eee',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: `${getStatusColor(order.status)}15`,
                                    color: getStatusColor(order.status),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getStatusIcon(order.status)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '14px' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            background: `${getStatusColor(order.status)}15`,
                                            color: getStatusColor(order.status)
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>
                                        {order.shipping_address?.firstName} {order.shipping_address?.lastName} • {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: 900, fontSize: '16px' }}>${order.total.toFixed(2)}</span>
                                    <ChevronRight size={18} color="#ccc" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Detail Panel */}
                    {selectedOrder && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '24px',
                                border: '1px solid #eee',
                                position: 'sticky',
                                top: '24px',
                                alignSelf: 'start'
                            }}
                        >
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>
                                    Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#888' }}>
                                    {new Date(selectedOrder.created_at).toLocaleString()}
                                </p>
                            </div>

                            {/* Status Update */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Update Status</label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Tracking Number */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Tracking Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter tracking number..."
                                    defaultValue={selectedOrder.tracking_number || ''}
                                    onBlur={e => {
                                        if (e.target.value !== selectedOrder.tracking_number) {
                                            updateTrackingNumber(selectedOrder.id, e.target.value);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                />
                            </div>

                            {/* Customer Info */}
                            <div style={{ padding: '16px', background: '#f9f9fb', borderRadius: '12px', marginBottom: '16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Customer</p>
                                <p style={{ fontWeight: 700, fontSize: '14px' }}>
                                    {selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}
                                </p>
                                <p style={{ fontSize: '13px', color: '#666' }}>{selectedOrder.shipping_address?.email}</p>
                            </div>

                            {/* Shipping Address */}
                            <div style={{ padding: '16px', background: '#f9f9fb', borderRadius: '12px', marginBottom: '16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Shipping Address</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
                                    {selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}<br />
                                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
                                </p>
                            </div>

                            {/* Order Total */}
                            <div style={{ padding: '16px', background: 'black', color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700 }}>Total</span>
                                <span style={{ fontWeight: 900, fontSize: '20px' }}>${selectedOrder.total.toFixed(2)}</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderManager;