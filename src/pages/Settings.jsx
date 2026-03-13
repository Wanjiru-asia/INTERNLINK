import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCog } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Vortex from '../components/ui/Vortex';

export default function Settings() {
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(true);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        alert('Security settings updated successfully!');
    };

    return (
        <div className="flex h-screen overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Vortex backgroundColor="#0f172a" baseHue={161} particleCount={300} rangeY={400} />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <Header title="Account Settings" />

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-2xl mx-auto space-y-8"
                    >
                        {/* Security Section */}
                        <section className="bg-[#1e293b] p-8 rounded-[2rem] border border-[#334155] shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Security & Password</h3>
                            </div>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-[#334155] focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)] transition-all font-medium text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-[#334155] focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)] transition-all font-medium text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-[#334155] focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)] transition-all font-medium text-white"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-[#10b981] text-white rounded-xl font-bold shadow-[0_4px_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-[1px] active:scale-[0.98] transition-all mt-4">
                                    Update Security Settings
                                </button>
                            </form>
                        </section>

                        {/* Account Settings */}
                        <section className="bg-[#1e293b] p-8 rounded-[2rem] border border-[#334155] shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <UserCog className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Account Configuration</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Push Notifications</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Receive alerts for new opportunities</div>
                                    </div>
                                    <button
                                        onClick={() => setPushNotifications(!pushNotifications)}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${pushNotifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pushNotifications ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Email Updates</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Weekly digest of matched applications</div>
                                    </div>
                                    <button
                                        onClick={() => setEmailUpdates(!emailUpdates)}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${emailUpdates ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailUpdates ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <div className="font-bold text-red-500">Deactivate Account</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Permanently remove your profile data</div>
                                    </div>
                                    <button onClick={() => alert('Account deactivation initiated.')} className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        Deactivate
                                    </button>
                                </div>
                            </div>
                        </section>

                    </motion.div>
                </main>
            </div>
        </div>
    );
}
