import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    ShieldCheck,
    Truck,
    Info,
    MessageCircle,
    ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const SupportLink = ({ to, title, description, icon: Icon }: any) => (
    <Link
        to={to}
        style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            background: '#fff',
            borderRadius: '20px',
            border: '1px solid #F1F5F9',
            transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5544ff';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#F1F5F9';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5544ff'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{description}</p>
            </div>
        </div>
        <ChevronRight size={20} color="#94A3B8" />
    </Link>
);

const HelpSupport = () => {
    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <main style={{ flex: 1, padding: '60px 40px', background: '#F8FAFC', minHeight: '100vh' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: 900,
                            color: '#0F172A',
                            letterSpacing: '-0.04em',
                            marginBottom: '16px'
                        }}>
                            Help & Support
                        </h1>
                        <p style={{ fontSize: '18px', color: '#64748B', fontWeight: 500 }}>
                            Everything you need to know about our store and policies.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <SupportLink
                            to="/page/about-us"
                            title="About Us"
                            description="Learn more about our mission and story."
                            icon={Info}
                        />
                        <SupportLink
                            to="/page/contact-us"
                            title="Contact Us"
                            description="Get in touch with our support team."
                            icon={MessageCircle}
                        />
                        <SupportLink
                            to="/page/shipping-policy"
                            title="Shipping & Returns"
                            description="Information about delivery times and rates."
                            icon={Truck}
                        />
                        <SupportLink
                            to="/page/privacy-policy"
                            title="Privacy Policy"
                            description="How we handle your personal data."
                            icon={ShieldCheck}
                        />
                        <SupportLink
                            to="/page/terms-and-conditions"
                            title="Terms & Conditions"
                            description="Rules and guidelines for using our store."
                            icon={FileText}
                        />
                    </div>

                    <div style={{
                        marginTop: '60px',
                        padding: '32px',
                        background: '#0F172A',
                        borderRadius: '24px',
                        textAlign: 'center',
                        color: '#fff'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Still need help?</h3>
                        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>Our team is available Monday through Friday, 9am - 5pm GMT.</p>
                        <a
                            href="mailto:support@techshop.com"
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                background: '#fff',
                                color: '#0F172A',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: '14px'
                            }}
                        >
                            Email Support
                        </a>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default HelpSupport;
