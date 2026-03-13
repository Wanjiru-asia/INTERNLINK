import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SearchX, Bookmark, Sparkles, CheckCircle, Navigation, Loader2, FileText, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Vortex from '../components/ui/Vortex';
import { useAuth } from '../context/AuthContext';

export default function Opportunities() {
    const { user } = useAuth();
    // Flow States: 'confirm' -> 'searching' -> 'results'
    const [step, setStep] = useState('confirm');

    // UI States
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [opportunities, setOpportunities] = useState([]);

    // Application States
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [applyStep, setApplyStep] = useState('drafting'); // 'drafting' -> 'review' -> 'submitting' -> 'success'
    const [coverLetter, setCoverLetter] = useState('');

    const filters = ['All', 'Remote', 'On-site', 'Full-time', 'Part-time', 'Internship', 'Attachment'];

    // Dynamic User Profile Data
    const [userProfile, setUserProfile] = useState({
        fullname: user?.fullname || 'User',
        skills: user?.skills || [],
        preferredRole: user?.techField || ''
    });

    useEffect(() => {
        if (user) {
            setUserProfile({
                fullname: user.fullname || 'User',
                skills: user.skills || [],
                preferredRole: user.techField || ''
            });
        }
    }, [user]);

    const handleConfirmAndSearch = async () => {
        setStep('searching');
        setOpportunities([]);

        try {
            const response = await fetch('http://127.0.0.1:3000/api/ai/search-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills: userProfile.skills,
                    preferredRole: userProfile.preferredRole
                })
            });

            const data = await response.json();
            if (response.ok) {
                setOpportunities(data.jobs);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setStep('results');
        }
    };

    const handleAiApplyClick = async (job) => {
        setSelectedJob(job);
        setIsApplyModalOpen(true);
        setApplyStep('drafting');
        setCoverLetter('');

        try {
            const response = await fetch('http://127.0.0.1:3000/api/ai/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.id,
                    jobTitle: job.title,
                    company: job.company,
                    userProfile: userProfile
                })
            });

            const data = await response.json();
            if (response.ok) {
                setCoverLetter(data.coverLetter);
                setApplyStep('review');
            }
        } catch (error) {
            console.error('Error drafting application:', error);
            setApplyStep('review');
            setCoverLetter('Error generating application. Please try again.');
        }
    };

    const confirmApplication = () => {
        setApplyStep('submitting');
        // Simulate network submission delay
        setTimeout(() => {
            setApplyStep('success');
            // Mock removing the job from the list to show it was applied to
            setOpportunities(prev => prev.filter(j => j.id !== selectedJob.id));
        }, 1500);
    };

    const closeApplyModal = () => {
        setIsApplyModalOpen(false);
        setTimeout(() => {
            setApplyStep('drafting');
            setSelectedJob(null);
            setCoverLetter('');
        }, 300); // Wait for modal close animation
    };

    return (
        <div className="flex h-screen overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Vortex backgroundColor="#0f172a" baseHue={161} particleCount={300} rangeY={400} />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <Header title="AI Job Matcher" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: CONFIRM DETAILS */}
                        {step === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-3xl mx-auto mt-12"
                            >
                                <div className="bg-[#1e293b] p-8 md:p-10 rounded-[2rem] border border-[#334155] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl rounded-tl-none"></div>

                                    <div className="relative z-10 text-center mb-8">
                                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-500/30">
                                            <Sparkles className="w-8 h-8" />
                                        </div>
                                        <h1 className="text-3xl font-extrabold text-white mb-3">AI Discovery Engine</h1>
                                        <p className="text-slate-400 font-medium max-w-lg mx-auto">Confirm your professional details. Our AI will scan hundreds of job boards to find attachments and internships perfectly suited for your skill level.</p>
                                    </div>

                                    <div className="bg-[#0f172a] rounded-2xl border border-[#334155] p-6 mb-8 space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Role</label>
                                            <input
                                                type="text"
                                                value={userProfile.preferredRole}
                                                onChange={(e) => setUserProfile({ ...userProfile, preferredRole: e.target.value })}
                                                className="w-full bg-[#1e293b] text-white font-medium px-4 py-3 rounded-xl border border-[#334155] focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Current Skills</label>
                                            <div className="flex flex-wrap gap-2">
                                                {userProfile.skills.map(skill => (
                                                    <span key={skill} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium border border-slate-700">
                                                        {skill}
                                                    </span>
                                                ))}
                                                <button onClick={() => alert('Skill addition workflow opening...')} className="px-3 py-1.5 border border-dashed border-slate-600 text-slate-500 rounded-lg text-sm font-medium hover:text-slate-300 hover:border-slate-500 transition-colors">
                                                    + Add Skill
                                                </button>
                                            </div>
                                            <p className="text-xs text-emerald-500 mt-3 font-medium flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> AI will explicitly avoid overselling skills not listed here.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConfirmAndSearch}
                                        className="w-full py-4 bg-[#10b981] text-white font-bold rounded-2xl text-lg shadow-[0_8px_32px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-[2px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Initialize AI Search
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: SEARCHING ANIMATION */}
                        {step === 'searching' && (
                            <motion.div
                                key="searching"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center relative z-10"
                            >
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                                    <div className="w-24 h-24 bg-[#1e293b] border-2 border-emerald-500/50 rounded-3xl flex items-center justify-center relative z-10 animate-bounce">
                                        <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-extrabold text-white mb-2">Analyzing Job Boards...</h2>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto">Matching your profile with current internship and attachment listings securely.</p>

                                <div className="mt-8 flex flex-col gap-3 w-64">
                                    <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Running Neural Match</span>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: RESULTS */}
                        {step === 'results' && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-7xl mx-auto space-y-8 pb-12"
                            >
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                            AI Recommendations <Sparkles className="w-5 h-5 text-emerald-500" />
                                        </h1>
                                        <p className="text-slate-500 font-medium">Found {opportunities.length} opportunities matching your realistic skill profile.</p>
                                    </div>
                                    <button
                                        onClick={() => setStep('confirm')}
                                        className="px-4 py-2 bg-[#1e293b] text-slate-300 text-sm font-bold rounded-xl border border-[#334155] hover:bg-[#334155] transition-colors"
                                    >
                                        Refine Profile
                                    </button>
                                </div>

                                {/* Filters */}
                                <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-[#334155] shadow-sm space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search within results..."
                                            className="w-full pl-12 pr-4 py-4 bg-[#0f172a] border border-[#334155] rounded-2xl focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)] transition-all font-medium text-white"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setActiveFilter(filter)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${activeFilter === filter
                                                    ? 'bg-[#10b981] text-white border-[#10b981]'
                                                    : 'border-[#334155] text-[#94a3b8] hover:border-[#10b981] hover:text-[#10b981]'
                                                    }`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {opportunities.length === 0 ? (
                                        <div className="col-span-full py-20 text-center text-[#94a3b8] bg-[#1e293b] rounded-[2rem] border border-dashed border-[#334155]">
                                            <SearchX className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <h3 className="text-lg font-bold text-white mb-2">No Matching Opportunities</h3>
                                            <p className="max-w-xs mx-auto text-sm font-medium">Try updating your profile preferences.</p>
                                        </div>
                                    ) : (
                                        opportunities
                                            .filter(job => activeFilter === 'All' || job.type === activeFilter || job.workType === activeFilter)
                                            .filter(job => job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((job) => (
                                                <div key={job.id} className="bg-[#1e293b] p-6 rounded-[2rem] border border-[#334155] shadow-sm hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-[2px] transition-all duration-300 group relative overflow-hidden flex flex-col">
                                                    <div className={`absolute top-0 right-0 w-32 h-32 ${job.bg} blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                                                    <div className="flex justify-between items-start mb-4 relative">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#0f172a] flex items-center justify-center border border-[#334155] group-hover:border-emerald-500/50 transition-all">
                                                            <span className={`text-xl font-bold ${job.color}`}>{job.company.charAt(0)}</span>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-1">
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] border border-[#334155] rounded-lg">
                                                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                                                <span className="text-emerald-400 text-[10px] font-extrabold">{job.matchScore}% Match</span>
                                                            </div>
                                                            <span className="px-2 py-0.5 bg-[#0f172a] text-slate-400 text-[9px] font-bold rounded-md uppercase border border-[#334155]">{job.type}</span>
                                                        </div>
                                                    </div>

                                                    <h4 className="text-lg font-extrabold text-white mb-1 tracking-tight leading-tight">{job.title}</h4>
                                                    <p className="text-xs font-bold text-slate-400 mb-3">{job.company} • <span className="text-emerald-400">{job.location}</span></p>

                                                    <p className="text-sm text-slate-300 font-medium mb-5 line-clamp-3 flex-1">{job.description}</p>

                                                    <div className="flex items-center gap-2 mb-6">
                                                        <span className="px-2.5 py-1 bg-[#0f172a] text-slate-300 text-[10px] font-bold rounded-lg border border-[#334155]">{job.workType}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-auto relative">
                                                        <button
                                                            onClick={() => handleAiApplyClick(job)}
                                                            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-sm shadow-[0_4px_24px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.5)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Navigation className="w-4 h-4 fill-current" /> Auto Apply
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); alert('Job saved to bookmarks!'); }} className="p-3 bg-[#0f172a] border border-[#334155] text-slate-400 hover:bg-[#1e293b] hover:text-white rounded-xl transition-all z-10">
                                                            <Bookmark className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* AI APPLICATION MODAL */}
                <AnimatePresence>
                    {isApplyModalOpen && selectedJob && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                                onClick={closeApplyModal}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-[#1e293b] border border-[#334155] shadow-2xl rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between bg-[#0f172a]/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                            <Sparkles className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm">AI Application Assistant</h3>
                                            <p className="text-slate-400 text-xs font-medium">Applying to {selectedJob.company}</p>
                                        </div>
                                    </div>
                                    <button onClick={closeApplyModal} className="p-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative">

                                    {applyStep === 'drafting' && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
                                            <h4 className="text-xl font-bold text-white mb-2">Drafting Application...</h4>
                                            <p className="text-slate-400 flex items-center justify-center gap-2 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Formulating realistic responsibilities
                                            </p>
                                        </div>
                                    )}

                                    {applyStep === 'review' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex gap-4 items-start">
                                                <div className="mt-1">
                                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h5 className="text-emerald-400 font-bold mb-1">Generated Draft Ready</h5>
                                                    <p className="text-sm text-emerald-500/80 font-medium">AI has crafted a realistic letter based on your verified skills. It explicitly avoids overselling to assure a natural fit.</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> Cover Letter
                                                </label>
                                                <div className="bg-[#0f172a] p-5 rounded-2xl border border-[#334155] text-slate-300 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                                    {coverLetter}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(applyStep === 'submitting' || applyStep === 'success') && (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            {applyStep === 'submitting' ? (
                                                <>
                                                    <Navigation className="w-16 h-16 text-emerald-500 fill-current animate-bounce mb-6" />
                                                    <h4 className="text-xl font-bold text-white mb-2">Sending to {selectedJob.company}...</h4>
                                                    <p className="text-slate-400 text-sm font-medium">Securing your application package.</p>
                                                </>
                                            ) : (
                                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                                        <CheckCircle className="w-10 h-10 text-white" />
                                                    </div>
                                                    <h4 className="text-2xl font-extrabold text-white mb-2">Application Sent!</h4>
                                                    <p className="text-slate-400 text-sm font-medium mb-8">Your realistic profile was submitted successfully.</p>
                                                    <button
                                                        onClick={closeApplyModal}
                                                        className="px-8 py-3 bg-[#334155] text-white font-bold rounded-xl hover:bg-[#475569] transition-colors"
                                                    >
                                                        Back to Opportunities
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {applyStep === 'review' && (
                                    <div className="p-6 border-t border-[#334155] bg-[#0f172a]/80 flex justify-end gap-3 rounded-b-3xl">
                                        <button
                                            onClick={closeApplyModal}
                                            className="px-5 py-2.5 text-slate-300 font-bold hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmApplication}
                                            className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                        >
                                            <Navigation className="w-4 h-4 fill-current" /> Confirm & Send
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
