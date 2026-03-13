import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FolderOpen, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Vortex from '../components/ui/Vortex';

export default function Applications() {
    // Hardcoded as empty similar to the original HTML behavior
    const applications = [];

    return (
        <div className="flex h-screen overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Vortex backgroundColor="#0f172a" baseHue={161} particleCount={300} rangeY={400} />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <Header title="My Applications" />

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-7xl mx-auto space-y-8"
                    >
                        {/* Applications Table */}
                        {applications.length > 0 ? (
                            <div className="bg-[#1e293b] rounded-[2rem] border border-[#334155] shadow-sm hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden">
                                <div className="p-6 border-b border-[#334155] flex items-center justify-between">
                                    <h3 className="font-extrabold text-white">Application History</h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 rounded-lg">
                                            All ({applications.length})
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50">
                                                <th className="px-8 py-5">Job Title</th>
                                                <th className="px-8 py-5">Company</th>
                                                <th className="px-8 py-5">Location</th>
                                                <th className="px-8 py-5">Date Applied</th>
                                                <th className="px-8 py-5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#334155]">
                                            {/* Data rows would go here if applications existed. They should use: <tr className="bg-transparent hover:bg-[rgba(16,185,129,0.03)] transition-colors"> */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-8 bg-[#1e293b] rounded-[2rem] border border-[#334155] hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-[2px] transition-all duration-300 text-center">
                                <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center mb-6 border border-[#334155]">
                                    <FolderOpen className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-extrabold text-white mb-2">No Applications Yet</h3>
                                <p className="text-[#94a3b8] font-medium max-w-xs mb-8">
                                    Your active and past applications will appear here once you start applying.
                                </p>
                                <Link to="/opportunities" className="px-8 py-4 bg-[#10b981] text-white font-bold rounded-2xl shadow-[0_4px_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center gap-2">
                                    Browse Opportunities
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
