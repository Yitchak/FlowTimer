import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Loader2 } from 'lucide-react';

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { signInWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await signInWithEmail(email);
            setStatus('sent');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-2 text-white">Sign In</h2>
                <p className="text-sm text-gray-400 mb-6">Save your timers and access them anywhere.</p>

                {status === 'sent' ? (
                    <div className="text-center py-6 bg-green-500/10 rounded-xl border border-green-500/20">
                        <Mail className="mx-auto mb-3 text-green-400" size={40} />
                        <h3 className="text-green-400 font-bold mb-1">Check your inbox!</h3>
                        <p className="text-xs text-gray-400">We sent a magic link to <span className="text-white">{email}</span></p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-colors">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {status === 'sending' ? <Loader2 className="animate-spin" size={18} /> : 'Send Magic Link'}
                        </button>
                        {status === 'error' && <p className="text-red-400 text-xs text-center">Error sending link. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginModal;
