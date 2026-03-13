import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, Bookmark, Calendar, Eye, Download, CheckCircle2, Circle, Inbox, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Vortex from '../components/ui/Vortex';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, userName } = useAuth();
    const firstName = userName ? userName.split(' ')[0] : 'Explorer';

    const [completion, setCompletion] = useState(0);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        // Fetch Applications
        fetch(`http://127.0.0.1:3000/api/user/${user.id}/applications`)
            .then(res => res.json())
            .then(data => setApplications(data.applications || []))
            .catch(err => console.error("Error fetching dashboard apps:", err));

        // Calculate realistic completion
        const weights = {
            fullName: 1,
            email: 1,
            phone: 9,
            institution: 10,
            bio: 25,
            linkedin: 7,
            github: 7,
            skills: 20,
            tools: 10,
            academicLevel: 5,
            techField: 5
        };

        let totalScore = 0;
        if (user.fullname) totalScore += weights.fullName;
        if (user.email) totalScore += weights.email;
        if (user.phone) totalScore += weights.phone;
        if (user.institution) totalScore += weights.institution;
        if (user.bio) totalScore += weights.bio;
        if (user.linkedin) totalScore += weights.linkedin;
        if (user.github) totalScore += weights.github;
        if (user.skills && user.skills.length > 0) totalScore += weights.skills;
        if (user.tools && user.tools.length > 0) totalScore += weights.tools;
        if (user.academic_level) totalScore += weights.academicLevel;
        if (user.technical_field) totalScore += weights.techField;

        setCompletion(Math.min(totalScore, 100));
    }, [user]);


    return (
        <div className="flex h-screen overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Vortex backgroundColor="#0f172a" baseHue={161} particleCount={300} rangeY={400} />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <Header title="Overview" />

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-7xl mx-auto space-y-8"
                    >
                        {/* 1. Welcome Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    Welcome back, <span>{firstName}</span>! 👋
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                                    Here's what's happening with your internship search today.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => alert('CV download started!')} className="px-5 py-2.5 bg-transparent border border-[#334155] text-[#94a3b8] rounded-xl font-bold text-sm hover:bg-[#1e293b] hover:text-white transition-all flex items-center gap-2">
                                    <Download size={16} />
                                    Download CV
                                </button>
                                <Link to="/opportunities" className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-bold text-sm shadow-[0_4px_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center">
                                    View Opportunities
                                </Link>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Applications Sent', value: applications.length.toString(), icon: Send, color: '#10b981', bg: 'bg-[#10b981]/[0.05]', iconBg: 'bg-[#10b981]/[0.15]', border: 'border-b-[#10b981]/30' },
                                { label: 'Saved Jobs', value: '0', icon: Bookmark, color: '#3b82f6', bg: 'bg-[#3b82f6]/[0.05]', iconBg: 'bg-[#3b82f6]/[0.15]', border: 'border-b-[#3b82f6]/30' },
                                { label: 'Interviews Scheduled', value: '0', icon: Calendar, color: '#8b5cf6', bg: 'bg-[#8b5cf6]/[0.05]', iconBg: 'bg-[#8b5cf6]/[0.15]', border: 'border-b-[#8b5cf6]/30' },
                                { label: 'Profile Views', value: '0', icon: Eye, color: '#f59e0b', bg: 'bg-[#f59e0b]/[0.05]', iconBg: 'bg-[#f59e0b]/[0.15]', border: 'border-b-[#f59e0b]/30' }
                            ].map((stat, i) => (
                                <div key={i} className={`bg-[#1e293b] p-6 rounded-[2rem] border border-[#334155] ${stat.border} border-b-[3px] shadow-sm hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-[2px] transition-all duration-300 relative overflow-hidden`}>
                                    <div className={`absolute inset-0 ${stat.bg} pointer-events-none`}></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className={`p-2 rounded-lg ${stat.iconBg}`} style={{ color: stat.color }}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white relative z-10">{stat.value}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 relative z-10">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Profile Completion Card */}
                            <div
                                className="lg:col-span-1 bg-[#1e293b] p-8 rounded-[2.5rem] border border-[#334155] shadow-2xl relative overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-500"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="font-bold text-white text-lg">Profile Strength</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                            completion < 30 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                            completion < 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                            {completion < 30 ? 'Incomplete' : completion < 70 ? 'Getting There' : 'Professional'}
                                        </span>
                                    </div>
                                
                                    <div className="relative w-40 h-40 mx-auto mb-8">
                                        <svg className="w-full h-full transform -rotate-90">
                                            {/* Track */}
                                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-800/50" />
                                            {/* Gradient Progress */}
                                            <defs>
                                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#34d399" />
                                                </linearGradient>
                                            </defs>
                                            <circle
                                                cx="80" cy="80" r="70"
                                                stroke="url(#progressGradient)"
                                                strokeWidth="14"
                                                strokeLinecap="round"
                                                fill="transparent"
                                                strokeDasharray="439.8"
                                                strokeDashoffset={439.8 - (439.8 * completion / 100)}
                                                className="transition-all duration-1000 ease-in-out"
                                                style={{ filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-white">{completion}%</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Global Rank</span>
                                        </div>
                                    </div>
                                
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {[
                                            { label: 'Bio', done: !!user?.bio },
                                            { label: 'Skills', done: user?.skills?.length > 0 },
                                            { label: 'Contact', done: !!user?.phone },
                                            { label: 'Academic', done: !!user?.institution }
                                        ].map((item, idx) => (
                                            <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${item.done ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/30 border-slate-700 text-slate-500'}`}>
                                                {item.done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                                <span className="text-[11px] font-bold">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <Link to="/profile" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-center shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] block relative z-10">
                                    Optimize Profile
                                </Link>
                            </div>

                            {/* Recent Applications Section */}
                            <div className="lg:col-span-2 bg-[#1e293b] rounded-[2rem] border border-[#334155] shadow-sm overflow-hidden flex flex-col hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-[2px] transition-all duration-300">
                                <div className="p-6 border-b border-[#334155] flex items-center justify-between">
                                    <h3 className="font-bold text-white">Recent Applications</h3>
                                    <Link to="/applications" className="text-xs font-bold text-[#10b981] hover:underline">View All History</Link>
                                </div>
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50">
                                                <th className="px-6 py-4">Job / Company</th>
                                                <th className="px-6 py-4">Applied Date</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#334155]">
                                            {applications.length > 0 ? (
                                                applications.slice(0, 3).map((app) => (
                                                    <tr key={app.id} className="bg-transparent hover:bg-[rgba(16,185,129,0.03)] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-white text-sm">{app.title}</div>
                                                            <div className="text-[10px] text-slate-500">{app.company}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                                                            {new Date(app.applied_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                                                app.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                app.status === 'Declined' ? 'bg-rose-500/10 text-rose-400' :
                                                                'bg-amber-500/10 text-amber-400'
                                                            }`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="bg-transparent hover:bg-[rgba(16,185,129,0.03)] transition-colors">
                                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Inbox size={32} className="opacity-20" />
                                                            <span className="text-xs font-medium">No recent applications found</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Opportunities */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    Recommended for You
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                        0 Matches
                                    </span>
                                </h3>
                                <Link to="/opportunities" className="text-sm font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400">
                                    Browse All
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                <div className="col-span-full py-12 text-center text-slate-400 bg-[#1e293b] rounded-[2rem] border border-dashed border-[#334155] hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-[2px] transition-all duration-300">
                                    <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Complete your profile to see personalized recommendations</p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </main>
            </div>
        </div>
    );
}
