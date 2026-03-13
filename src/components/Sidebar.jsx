import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, User, Briefcase, FileText, Settings, LogOut, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', collapsed);
    }, [collapsed]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
        { name: 'Applications', path: '/applications', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside
            className={cn(
                "h-screen bg-[#0f172a]/80 backdrop-blur-xl border-r border-[#334155]/50 transition-all duration-500 ease-in-out flex flex-col relative shrink-0 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]",
                collapsed ? "w-20" : "w-64"
            )}
            style={{ WebkitBackdropFilter: 'blur(20px)' }}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between h-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 blur-[40px] -mt-12 -ml-12 pointer-events-none"></div>
                
                <div className={cn("flex items-center gap-3 transition-all duration-300", collapsed ? "mx-auto" : "")}>
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(16,185,129,0.4)] transform group-hover:scale-105 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3l1.912 5.886h6.191l-5.008 3.638 1.912 5.886L12 14.772l-5.007 3.638 1.912-5.886-5.008-3.638h6.191L12 3z" />
                            </svg>
                        </div>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-black text-2xl text-white tracking-tighter leading-none">AIVOLT</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Tracker Hub</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3.5 top-10 bg-emerald-500 text-white rounded-xl p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all border-2 border-[#0f172a] z-[60] flex items-center justify-center hover:scale-110 active:scale-95"
            >
                {collapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {!collapsed && (
                    <div className="px-4 mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">General</span>
                    </div>
                )}
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                            isActive
                                ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] border border-emerald-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.08] to-transparent rounded-2xl -z-10"
                                    />
                                )}
                                <item.icon 
                                    size={20} 
                                    className={cn(
                                        "transition-all duration-300", 
                                        isActive ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "group-hover:text-emerald-400 group-hover:scale-110"
                                    )} 
                                />
                                {!collapsed && (
                                    <span className={cn(
                                        "font-bold text-sm tracking-wide transition-all duration-300",
                                        isActive ? "text-white" : "group-hover:text-white"
                                    )}>
                                        {item.name}
                                    </span>
                                )}
                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#334155]/30">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 group shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20",
                        collapsed ? "justify-center px-0" : ""
                    )}
                >
                    <LogOut size={20} className="transition-transform group-hover:rotate-12" />
                    {!collapsed && <span className="font-bold text-sm tracking-wide">Logout Account</span>}
                </button>
            </div>
        </aside>
    );
}
