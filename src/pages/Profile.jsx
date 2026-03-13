
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Briefcase, Target, ChevronDown, Linkedin, Github, Plus, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Vortex from '../components/ui/Vortex';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:3000';

export default function Profile() {
    const { user, login, userId, refreshUser, userName, userEmail } = useAuth();

    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: userName || '',
        email: userEmail || '',
        phone: '',
        technical_field: 'Business Administration',
        academic_level: 'Non-Degree / Certificate',
        institution: '',
        bio: '',
        linkedin: '',
        github: '',
        opportunity_type: 'Internship',
        work_preference: 'Hybrid',
        relocation: 'Yes'
    });

    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    const [tools, setTools] = useState(user?.tools || []);
    const [toolInput, setToolInput] = useState('');

    const [loading, setLoading] = useState(false);

    // Update formData when context loads
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullname || '',
                email: user.email || '',
                phone: user.phone || '',
                technical_field: user.technical_field || 'Business Administration',
                academic_level: user.academic_level || 'Non-Degree / Certificate',
                institution: user.institution || '',
                bio: user.bio || '',
                linkedin: user.linkedin || '',
                github: user.github || '',
                opportunity_type: user.opportunity_type || 'Internship',
                work_preference: user.work_preference || 'Hybrid',
                relocation: user.relocation || 'Yes'
            });
            setSkills(user.skills || []);
            setTools(user.tools || []);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const addTag = (type) => {
        if (type === 'skill') {
            const val = skillInput.trim();
            if (val && !skills.includes(val)) setSkills([...skills, val]);
            setSkillInput('');
        } else {
            const val = toolInput.trim();
            if (val && !tools.includes(val)) setTools([...tools, val]);
            setToolInput('');
        }
    };

    const removeTag = (type, item) => {
        if (type === 'skill') {
            setSkills(skills.filter(s => s !== item));
        } else {
            setTools(tools.filter(t => t !== item));
        }
    };

    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(type);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const profileData = { ...formData, skills, tools };

        try {
            const response = await fetch(`${API_BASE}/api/user/${userId}/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                await refreshUser();
                setIsEditing(false);
                alert('Profile updated and saved to the database!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    // Helper classes for inputs based on editing state
    const inputBaseClass = "w-full h-16 pt-5 px-4 rounded-xl outline-none transition-all font-medium text-white border-2 peer placeholder-transparent";

    const inputClass = isEditing
        ? `${inputBaseClass} bg-[#0f172a] border-[#334155] focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]`
        : `${inputBaseClass} bg-[#1e293b]/50 border-transparent`;

    const labelClass = "absolute left-4 top-5 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 pointer-events-none";

    return (
        <div className="flex h-screen overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Vortex backgroundColor="#0f172a" baseHue={161} particleCount={300} rangeY={400} />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

                <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#334155] flex items-center justify-between px-8 shrink-0 z-40 sticky top-0" style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}>
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white">My Professional Profile</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={loading}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isEditing
                                ? 'bg-transparent border border-[#334155] text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
                                : 'bg-[#10b981] text-white shadow-[0_4px_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-[1px] active:scale-[0.98]'
                                } disabled:opacity-50`}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Viewing Mode' : 'Edit Profile')}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-4xl mx-auto space-y-8 pb-12"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Basic Information */}
                            <section className="bg-[#1e293b] p-8 rounded-[2rem] border border-[#334155] shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Info className="text-emerald-500" size={24} />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} placeholder=" " className={inputClass} required />
                                        <label htmlFor="fullName" className={labelClass}>Full Name</label>
                                    </div>
                                    <div className="relative group">
                                        <input type="email" id="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} placeholder=" " className={inputClass} required />
                                        <label htmlFor="email" className={labelClass}>Email Address</label>
                                    </div>
                                    <div className="relative group">
                                        <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder=" " className={inputClass} />
                                        <label htmlFor="phone" className={labelClass}>Phone Number</label>
                                    </div>
                                </div>
                            </section>

                            {/* Professional Information */}
                            <section className="bg-[#1e293b] p-8 rounded-[2rem] border border-[#334155] shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Briefcase className="text-emerald-500" size={24} />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Professional Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <select id="technical_field" value={formData.technical_field} onChange={handleInputChange} disabled={!isEditing} className={`appearance-none ${inputClass}`}>
                                            <optgroup label="Business & Economics">
                                                <option>Business Administration</option>
                                                <option>Finance & Accounting</option>
                                                <option>Economics & Statistics</option>
                                                <option>Project Management</option>
                                                <option>Supply Chain & Logistics</option>
                                                <option>Human Resources Management</option>
                                                <option>Marketing & Communication</option>
                                                <option>Commerce</option>
                                            </optgroup>
                                            <optgroup label="Technology & Engineering">
                                                <option>Software Engineering</option>
                                                <option>Artificial Intelligence</option>
                                                <option>Computer Science</option>
                                                <option>Information Technology</option>
                                                <option>Data Science & Analytics</option>
                                                <option>Cybersecurity</option>
                                                <option>Civil Engineering</option>
                                                <option>Electrical & Electronic Engineering</option>
                                                <option>Mechanical Engineering</option>
                                                <option>Mechatronics Engineering</option>
                                            </optgroup>
                                            <optgroup label="Health & Sciences">
                                                <option>Medicine & Surgery</option>
                                                <option>Nursing</option>
                                                <option>Pharmacy</option>
                                                <option>Medical Laboratory Science</option>
                                                <option>Public Health</option>
                                                <option>Clinical Medicine</option>
                                                <option>Nutrition & Dietetics</option>
                                                <option>Microbiology</option>
                                                <option>Biochemistry</option>
                                            </optgroup>
                                            <optgroup label="Law & Social Sciences">
                                                <option>Law (LLB)</option>
                                                <option>Political Science</option>
                                                <option>Psychology</option>
                                                <option>Sociology</option>
                                                <option>International Relations</option>
                                                <option>Criminology & Security Studies</option>
                                                <option>Public Administration</option>
                                            </optgroup>
                                            <optgroup label="Agriculture & Environment">
                                                <option>Agriculture & Biotechnology</option>
                                                <option>Food Science & Technology</option>
                                                <option>Environmental Science</option>
                                                <option>Animal Science</option>
                                                <option>Horticulture</option>
                                                <option>Agribusiness Management</option>
                                            </optgroup>
                                            <optgroup label="Hospitality & Arts">
                                                <option>Hospitality & Tourism Management</option>
                                                <option>Culinary Arts</option>
                                                <option>Graphic Design</option>
                                                <option>Interior Design</option>
                                                <option>Fine Arts</option>
                                                <option>Music & Theatre Studies</option>
                                            </optgroup>
                                            <optgroup label="Education">
                                                <option>Education (Arts)</option>
                                                <option>Education (Science)</option>
                                                <option>Early Childhood Education</option>
                                                <option>Special Needs Education</option>
                                            </optgroup>
                                        </select>
                                        <label htmlFor="technical_field" className={labelClass}>Technical Field of Study</label>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>

                                     <div className="relative group">
                                        <select id="academic_level" value={formData.academic_level} onChange={handleInputChange} disabled={!isEditing} className={`appearance-none ${inputClass}`}>
                                            <optgroup label="Vocational & Technical">
                                                <option>Vocational Training / Trade School</option>
                                                <option>Non-Degree / Certificate</option>
                                                <option>Diploma Student</option>
                                                <option>Higher National Diploma</option>
                                            </optgroup>
                                            <optgroup label="Undergraduate / Degree">
                                                <option>Degree (1st/2nd Year)</option>
                                                <option>Degree (3rd/4th Year)</option>
                                                <option>Final Year / Project Phase</option>
                                            </optgroup>
                                            <optgroup label="Postgraduate & Beyond">
                                                <option>Postgraduate Diploma</option>
                                                <option>Masters Student</option>
                                                <option>PhD Candidate</option>
                                                <option>Continuing Professional Development</option>
                                            </optgroup>
                                            <optgroup label="Alumni">
                                                <option>Recent Graduate (Job Seeker)</option>
                                            </optgroup>
                                        </select>
                                        <label htmlFor="academic_level" className={labelClass}>Academic Level</label>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>

                                    <div className="relative group md:col-span-2">
                                        <input type="text" id="institution" value={formData.institution} onChange={handleInputChange} disabled={!isEditing} placeholder=" " className={inputClass} />
                                        <label htmlFor="institution" className={labelClass}>Institution & Program</label>
                                    </div>

                                    <div className="relative group md:col-span-2 pt-2">
                                        <textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder=" "
                                            rows={3}
                                            maxLength={300}
                                            className={`w-full min-h-[120px] pt-7 px-4 rounded-xl outline-none transition-all font-medium text-white border-2 peer placeholder-transparent resize-none ${isEditing
                                                ? 'bg-[#0f172a] border-[#334155] focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]'
                                                : 'bg-[#1e293b]/50 border-transparent'
                                                }`}
                                        ></textarea>
                                        <label htmlFor="bio" className={labelClass}>Professional Bio</label>
                                        {isEditing && (
                                            <div className={`text-xs text-right mt-1 ${formData.bio.length >= 280 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                {formData.bio.length} / 300
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Online Presence</span>
                                    </div>

                                    <div className="relative group">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                                        <input type="url" id="linkedin" value={formData.linkedin} onChange={handleInputChange} disabled={!isEditing} placeholder=" " className={`${inputClass} pl-12`} />
                                        <label htmlFor="linkedin" className={`absolute left-12 top-5 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:-translate-x-8 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-x-8 pointer-events-none`}>LinkedIn Profile</label>
                                    </div>

                                    <div className="relative group">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                                        <input type="url" id="github" value={formData.github} onChange={handleInputChange} disabled={!isEditing} placeholder=" " className={`${inputClass} pl-12`} />
                                        <label htmlFor="github" className={`absolute left-12 top-5 text-slate-400 text-sm font-semibold transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:-translate-x-8 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-x-8 pointer-events-none`}>GitHub Portfolio</label>
                                    </div>

                                    {/* Skills tags */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skills</label>
                                        <div className={`flex flex-wrap gap-2 p-3 min-h-[60px] rounded-xl border items-start content-start ${isEditing ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#1e293b]/50 border-transparent'}`}>
                                            {skills.length === 0 && (
                                                <span className="text-xs text-slate-400 italic w-full text-center py-3">No skills added yet</span>
                                            )}
                                            {skills.map((skill, idx) => (
                                                <span key={idx} className="bg-emerald-900 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                                    {skill}
                                                    {isEditing && (
                                                        <button type="button" onClick={() => removeTag('skill', skill)} className="hover:text-red-500 transition-colors">
                                                            <X size={12} strokeWidth={3} />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                        {isEditing && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, 'skill')}
                                                    placeholder="Type and press Enter to add..."
                                                    className="flex-1 h-12 px-4 bg-[#0f172a] border border-[#334155] rounded-xl text-sm font-medium text-white outline-none focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                                                />
                                                <button type="button" onClick={() => addTag('skill')} className="h-12 w-12 flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shrink-0">
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tools tags */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tools</label>
                                        <div className={`flex flex-wrap gap-2 p-3 min-h-[60px] rounded-xl border items-start content-start ${isEditing ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#1e293b]/50 border-transparent'}`}>
                                            {tools.length === 0 && (
                                                <span className="text-xs text-slate-400 italic w-full text-center py-3">No tools added yet</span>
                                            )}
                                            {tools.map((tool, idx) => (
                                                <span key={idx} className="bg-emerald-900 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                                    {tool}
                                                    {isEditing && (
                                                        <button type="button" onClick={() => removeTag('tool', tool)} className="hover:text-red-500 transition-colors">
                                                            <X size={12} strokeWidth={3} />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                        {isEditing && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    value={toolInput}
                                                    onChange={(e) => setToolInput(e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, 'tool')}
                                                    placeholder="Type and press Enter to add..."
                                                    className="flex-1 h-12 px-4 bg-[#0f172a] border border-[#334155] rounded-xl text-sm font-medium text-white outline-none focus:border-[#10b981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                                                />
                                                <button type="button" onClick={() => addTag('tool')} className="h-12 w-12 flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shrink-0">
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </section>

                            {/* Job Preferences */}
                            <section className="bg-[#1e293b] p-8 rounded-[2rem] border border-[#334155] shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Target className="text-emerald-500" size={24} />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Job Preferences</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative group">
                                        <select id="opportunity_type" value={formData.opportunity_type} onChange={handleInputChange} disabled={!isEditing} className={`appearance-none ${inputClass}`}>
                                            <option>Internship</option>
                                            <option>Industrial Attachment</option>
                                            <option>Volunteering</option>
                                            <option>Graduate Program</option>
                                        </select>
                                        <label htmlFor="opportunity_type" className={labelClass}>Opportunity Type</label>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <select id="work_preference" value={formData.work_preference} onChange={handleInputChange} disabled={!isEditing} className={`appearance-none ${inputClass}`}>
                                            <option>Remote</option>
                                            <option>On-site</option>
                                            <option>Hybrid</option>
                                        </select>
                                        <label htmlFor="work_preference" className={labelClass}>Work Preference</label>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <div className="relative group">
                                        <select id="relocation" value={formData.relocation} onChange={handleInputChange} disabled={!isEditing} className={`appearance-none ${inputClass}`}>
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                        <label htmlFor="relocation" className={labelClass}>Relocation</label>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </section>

                            {isEditing && (
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3.5 bg-transparent border border-[#334155] text-[#94a3b8] font-bold rounded-xl hover:bg-[#1e293b] hover:text-white transition-all">
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="px-8 py-3.5 bg-[#10b981] text-white font-bold rounded-xl shadow-[0_4px_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-[1px] transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                        </form>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
