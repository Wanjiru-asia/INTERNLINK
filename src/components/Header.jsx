import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ title }) {
    const { userName } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    const initials = userName
        ? userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : 'U';

    const notifications = [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header
            className="h-20 bg-[#0f172a]/40 backdrop-blur-xl border-b border-[#334155]/30 flex items-center justify-between px-8 text-white z-40 sticky top-0 transition-all duration-300"
            style={{ WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)' }}
        >
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

            <div className="flex items-center gap-6">

                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative text-slate-400 hover:text-emerald-500 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all mt-1 ${showNotifications ? 'text-emerald-500' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-4 w-80 bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                            >
                                <div className="px-4 py-3 border-b border-[#334155] bg-[#0f172a]/50 flex items-center justify-between">
                                    <h3 className="font-bold text-sm">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                onClick={() => alert(`Opening notification: ${notif.text}`)}
                                                key={notif.id}
                                                className={`p-4 border-b border-[#334155] last:border-0 hover:bg-[#334155]/30 cursor-pointer transition-colors flex gap-3 ${!notif.read ? 'bg-[#10b981]/5' : ''}`}
                                            >
                                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                                                    {!notif.read ? <Info size={14} /> : <Check size={14} />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                                                        {notif.text}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 px-6 text-center text-slate-500">
                                            <div className="w-12 h-12 bg-[#0f172a]/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#334155]">
                                                <Bell className="w-5 h-5 opacity-20" />
                                            </div>
                                            <p className="text-sm font-medium">No new notifications</p>
                                            <p className="text-[10px] mt-1 font-bold uppercase tracking-widest opacity-60">You're all caught up</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-[#334155] bg-[#0f172a]/50">
                                    <button onClick={() => alert('All notifications marked as read.')} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                                        Mark all as read
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium leading-none mb-1">{userName || 'User'}</p>
                        <p className="text-xs text-slate-400">Attachee</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shadow-[0_0_0_2px_#10b981]">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
