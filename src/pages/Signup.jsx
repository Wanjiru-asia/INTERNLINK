import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Vortex from '../components/ui/Vortex';
import { API_BASE } from '../config';
import { motion } from 'framer-motion';

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Animation Refs
    const charPurple = useRef(null);
    const eyesPurple = useRef(null);
    const pupilsPurple = useRef([]);
    const charBlack = useRef(null);
    const eyesBlack = useRef(null);
    const pupilsBlack = useRef([]);
    const charOrange = useRef(null);
    const eyesOrange = useRef(null);
    let pupilsOrange = useRef([]);
    const charYellow = useRef(null);
    const eyesYellow = useRef(null);
    const pupilsYellow = useRef([]);

    const mouseData = useRef({ x: 0, y: 0 });
    const isTyping = useRef(false);
    const isLookingAtEachOther = useRef(false);
    const isPurplePeeking = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseData.current = { x: e.clientX, y: e.clientY };
            updateAnimations();
        };
        window.addEventListener('mousemove', handleMouseMove);

        const blink = (charId) => {
            setTimeout(() => {
                let blinkEyes = [];
                if (charId === 'purple' && eyesPurple.current) blinkEyes = eyesPurple.current.querySelectorAll('.eye-blink');
                if (charId === 'black' && eyesBlack.current) blinkEyes = eyesBlack.current.querySelectorAll('.eye-blink');

                blinkEyes.forEach(e => e.style.height = '2px');
                setTimeout(() => {
                    blinkEyes.forEach(e => e.style.height = (charId === 'purple' ? '24px' : '20px'));
                    blink(charId);
                }, 150);
            }, Math.random() * 4000 + 3000);
        };
        blink('purple');
        blink('black');

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [showPassword, showConfirm]);

    const calculateTrack = (ref, strength = 12) => {
        if (!ref.current) return { x: 0, y: 0 };
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 3;

        const deltaX = mouseData.current.x - cx;
        const deltaY = mouseData.current.y - cy;

        return {
            x: Math.max(-strength, Math.min(strength, deltaX / 25)),
            y: Math.max(-strength, Math.min(strength, deltaY / 35))
        };
    };

    const updateAnimations = () => {
        const chars = [
            { id: 'purple', body: charPurple, eyes: eyesPurple, pupils: pupilsPurple.current },
            { id: 'black', body: charBlack, eyes: eyesBlack, pupils: pupilsBlack.current },
            { id: 'orange', body: charOrange, eyes: eyesOrange, pupils: pupilsOrange.current },
            { id: 'yellow', body: charYellow, eyes: eyesYellow, pupils: pupilsYellow.current }
        ];

        chars.forEach(({ id, body, eyes, pupils }) => {
            if (!body.current || !eyes.current) return;
            const track = calculateTrack(body);
            let overrideEyes = null;
            let bodySkew = -track.x * (id === 'black' ? 1.5 : 1.2);

            const isAnyPasswordVisible = showPassword || showConfirm;

            if (isAnyPasswordVisible) {
                overrideEyes = { x: -track.x, y: -track.y };
                bodySkew = 0;
            }

            if (isLookingAtEachOther.current) {
                if (id === 'purple') overrideEyes = { x: 8, y: 4 };
                if (id === 'black') overrideEyes = { x: -8, y: -4 };
            }

            if (id === 'purple' && isPurplePeeking.current) overrideEyes = { x: 5, y: 5 };

            if (overrideEyes) {
                eyes.current.style.transform = `translate(${overrideEyes.x}px, ${overrideEyes.y}px)`;
                pupils.forEach(p => p && (p.style.transform = `translate(${overrideEyes.x * 0.5}px, ${overrideEyes.y * 0.5}px)`));
            } else {
                eyes.current.style.transform = `translate(${track.x}px, ${track.y}px)`;
                pupils.forEach(p => p && (p.style.transform = `translate(${track.x * 0.5}px, ${track.y * 0.5}px)`));
            }
            body.current.style.transform = `skewX(${bodySkew}deg)`;
        });
    };

    const setPupilRef = (arr, i) => el => {
        if (el) arr[i] = el;
    };

    const handleInputFocus = () => {
        isTyping.current = true;
        isLookingAtEachOther.current = true;
        setTimeout(() => {
            isLookingAtEachOther.current = false;
            updateAnimations();
        }, 800);
        updateAnimations();
    };

    const handleInputBlur = () => {
        isTyping.current = false;
        updateAnimations();
    };

    const togglePasswordVisibility = (setter, currentValue, value) => {
        setter(!currentValue);
        if (!currentValue && value?.length > 0) {
            isPurplePeeking.current = true;
            setTimeout(() => { isPurplePeeking.current = false; }, 800);
        }
        updateAnimations();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const r = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, email, password })
            });
            const d = await r.json();

            if (r.ok) {
                login({ id: d.userId, fullname, email });
                setSuccess(true);
            } else {
                setError(d.error || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen flex items-center justify-center p-4 relative"
        >
            <Vortex backgroundColor="#0f172a" baseHue={161} particleCount={500} rangeY={600} />

            <div className="z-10 w-full max-w-[1100px] bg-[#0f172a]/85 rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row border border-[#334155] shadow-[0_0_60px_-20px_rgba(16,185,129,0.3)] min-h-[750px]" style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}>

                {/* Left Panel */}
                <div className="lg:w-[55%] relative overflow-hidden bg-emerald-600/20 flex flex-col justify-between p-12 text-white border-r border-[#334155]">
                    <div className="relative z-20 flex items-center gap-2 text-xl font-bold">
                        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/5">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 3l1.912 5.886h6.191l-5.008 3.638 1.912 5.886L12 14.772l-5.007 3.638 1.912-5.886-5.008-3.638h6.191L12 3z" />
                            </svg>
                        </div>
                        <span>Aivolt</span>
                    </div>

                    <div className="relative z-20 flex items-end justify-center px-4 mix-blend-screen">
                        <div className="relative w-full max-w-[500px]" style={{ height: "400px" }}>
                            <div className="absolute bottom-0 w-[80%] h-[20px] bg-emerald-500/20 blur-xl left-1/2 -translate-x-1/2 rounded-full"></div>

                            {/* Character Purple */}
                            <div ref={charPurple} className="absolute bottom-0 transition-transform duration-700 ease-out" style={{ left: '15%', width: '35%', height: '400px', backgroundColor: '#6C3FF5', borderRadius: '12px 12px 0 0', zIndex: 1, transformOrigin: 'bottom center' }}>
                                <div ref={eyesPurple} className="absolute flex gap-8 z-10" style={{ left: '25%', top: '10%' }}>
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden transition-all duration-150 eye-blink">
                                        <div ref={setPupilRef(pupilsPurple.current, 0)} className="w-2.5 h-2.5 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden transition-all duration-150 eye-blink">
                                        <div ref={setPupilRef(pupilsPurple.current, 1)} className="w-2.5 h-2.5 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Character Black */}
                            <div ref={charBlack} className="absolute bottom-0 transition-transform duration-700 ease-out" style={{ left: '45%', width: '25%', height: '320px', backgroundColor: '#2D2D2D', borderRadius: '10px 10px 0 0', zIndex: 2, transformOrigin: 'bottom center' }}>
                                <div ref={eyesBlack} className="absolute flex gap-6 z-10" style={{ left: '20%', top: '10%' }}>
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden transition-all duration-150 eye-blink">
                                        <div ref={setPupilRef(pupilsBlack.current, 0)} className="w-2 h-2 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden transition-all duration-150 eye-blink">
                                        <div ref={setPupilRef(pupilsBlack.current, 1)} className="w-2 h-2 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Character Orange */}
                            <div ref={charOrange} className="absolute bottom-0 transition-transform duration-700 ease-out" style={{ left: '0', width: '45%', height: '180px', backgroundColor: '#FF9B6B', borderRadius: '100px 100px 0 0', zIndex: 3, transformOrigin: 'bottom center' }}>
                                <div ref={eyesOrange} className="absolute flex gap-10 z-10" style={{ left: '35%', top: '45%' }}>
                                    <div ref={setPupilRef(pupilsOrange.current, 0)} className="w-4 h-4 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                    <div ref={setPupilRef(pupilsOrange.current, 1)} className="w-4 h-4 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                </div>
                            </div>

                            {/* Character Yellow */}
                            <div ref={charYellow} className="absolute bottom-0 transition-transform duration-700 ease-out" style={{ left: '60%', width: '30%', height: '210px', backgroundColor: '#E8D754', borderRadius: '60px 60px 0 0', zIndex: 4, transformOrigin: 'bottom center' }}>
                                <div ref={eyesYellow} className="absolute flex flex-col items-center gap-4 z-10" style={{ left: '30%', top: '20%' }}>
                                    <div className="flex gap-6">
                                        <div ref={setPupilRef(pupilsYellow.current, 0)} className="w-4 h-4 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                        <div ref={setPupilRef(pupilsYellow.current, 1)} className="w-4 h-4 rounded-full bg-zinc-800 transition-transform duration-100"></div>
                                    </div>
                                    <div className="w-[60%] h-1.5 bg-zinc-800 rounded-full"></div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="relative z-20 flex gap-8 text-[10px] font-bold uppercase tracking-[2px] opacity-60">
                        <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Help</a>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="lg:w-[45%] flex flex-col justify-center p-12 lg:p-16 relative">
                    <div className="w-full max-w-[380px] mx-auto">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Join Internlink Kenya</h2>
                    <p className="text-slate-400 font-medium italic">The #1 hub for Kenyan internship & attachment tracking.</p>
                        </div>

                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-5 relative">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="fullname"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        placeholder=" "
                                        required
                                        className="w-full h-14 pt-4 px-4 bg-[#0f172a] border-2 border-[#334155] focus:border-[#10b981] rounded-xl outline-none transition-all font-medium text-white peer placeholder-transparent focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                                    />
                                    <label
                                        htmlFor="fullname"
                                        className="absolute left-4 top-4 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 pointer-events-none"
                                    >
                                        Full Name
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        placeholder=" "
                                        required
                                        className="w-full h-14 pt-4 px-4 bg-[#0f172a] border-2 border-[#334155] focus:border-[#10b981] rounded-xl outline-none transition-all font-medium text-white peer placeholder-transparent focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-4 top-4 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 pointer-events-none"
                                    >
                                        Email Address
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        placeholder=" "
                                        required
                                        className="w-full h-14 pt-4 px-4 pr-12 bg-[#0f172a] border-2 border-[#334155] focus:border-[#10b981] rounded-xl outline-none transition-all font-medium text-white peer placeholder-transparent focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-4 top-4 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 pointer-events-none"
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility(setShowPassword, showPassword, password)}
                                        className={`absolute right-4 top-4 transition-colors ${showPassword ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>

                                <div className="relative group">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        id="confirm_password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        placeholder=" "
                                        required
                                        className="w-full h-14 pt-4 px-4 pr-12 bg-[#0f172a] border-2 border-[#334155] focus:border-[#10b981] rounded-xl outline-none transition-all font-medium text-white peer placeholder-transparent focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                                    />
                                    <label
                                        htmlFor="confirm_password"
                                        className="absolute left-4 top-4 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 pointer-events-none"
                                    >
                                        Confirm Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility(setShowConfirm, showConfirm, confirmPassword)}
                                        className={`absolute right-4 top-4 transition-colors ${showConfirm ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                                    >
                                        {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 py-1">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        required
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                                    />
                                    <label htmlFor="terms" className="text-xs font-medium text-slate-400 select-none">
                                        I agree to the <a href="#" className="text-emerald-500 hover:underline">Terms of Service</a>
                                    </label>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-[#10b981] text-white font-bold rounded-xl shadow-[0_4px_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] transition-all hover:-translate-y-[1px] active:scale-[0.98] uppercase tracking-wider relative overflow-hidden flex items-center justify-center disabled:opacity-70 disabled:active:scale-100 mt-2"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} />
                                            Initializing...
                                        </span>
                                    ) : (
                                        <span>Power Up</span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Profile Initialized</h2>
                                <p className="text-slate-400 font-medium mb-8">Your Internlink identity is now live in the network.</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="font-bold text-emerald-500 hover:text-emerald-400 hover:underline underline-offset-4"
                                >
                                    Check your Dashboard
                                </button>
                            </div>
                        )}

                        <p className="text-center mt-10 text-sm font-semibold text-slate-400">
                            Already have an account? <Link to="/login" className="text-emerald-500 font-bold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
