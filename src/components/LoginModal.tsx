import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';


interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { signInWithEmail, signInWithGoogle } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');

    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    useEffect(() => {
        console.log("LoginModal Component MOUNTED");
    }, []);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("FORM SUBMIT EVENT FIRED");

        setStatus('sending');
        try {
            await signInWithEmail(email);
            setStatus('sent');
            toast.success(t('login.magicLinkSent'));
        } catch (error: any) {

            console.error("Login LOGGED Error:", error);
            setStatus('error');
            toast.error(error.message || t('login.error'));
        }

    };

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            fontFamily: 'sans-serif'
        }}>
            {/* Simple Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)'
                }}
            />

            {/* Content */}
            <div style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '380px',
                position: 'relative',
                zIndex: 100000,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>{t('login.title')}</h2>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '24px' }}>{t('login.subtitle')}</p>


                {status === 'sent' ? (
                    <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <Mail size={40} color="#4ade80" />
                        </div>
                        <h3 style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '4px' }}>{t('login.checkInbox')}</h3>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{t('login.sentTo')} <span style={{ color: 'white' }}>{email}</span></p>

                        <button
                            onClick={onClose}
                            style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                            {t('login.close')}
                        </button>

                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => {
                                onClose();
                                signInWithGoogle().catch(e => toast.error("Google Sign-In failed: " + e.message));
                            }}
                            style={{
                                width: '100%',
                                backgroundColor: 'white',
                                color: 'black',
                                fontWeight: 'bold',
                                padding: '12px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                            {t('login.google')}
                        </button>


                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', flex: 1 }} />
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>{t('login.or')}</span>
                            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', flex: 1 }} />

                        </div>

                        <form onSubmit={handleEmailLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="email" style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginLeft: '4px' }}>{t('login.emailLabel')}</label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        fontSize: '14px',
                                        color: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                onMouseDown={() => console.log("Button Mouse Down!")}
                                onClick={() => console.log("Button Clicked!")}
                                disabled={status === 'sending'}
                                style={{
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    border: 'none',
                                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                    opacity: status === 'sending' ? 0.7 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status === 'sending' ? <Loader2 className="animate-spin" size={18} /> : t('login.sendLink')}
                            </button>

                            {status === 'error' && <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center' }}>{t('login.error')}</p>}

                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default LoginModal;
