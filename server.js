require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('\n[DATABASE CONNECTION ERROR] 🛑');
        console.error('Reason:', err.message);
        console.log('TIP: Check your .env file and ensure MySQL is running.');
        process.exit(1); // Stop the server if DB is not reachable
    }
    console.log('\n[DATABASE CONNECTED] ✅');
    console.log(`Resource: MySQL (${process.env.DB_NAME})\n`);
});

// Health Check
app.get('/', (req, res) => {
    res.send('<h1>🚀 Internlink Server is LIVE</h1><p>The backend is successfully talking to the browser.</p>');
});

// Registration API Endpoint
app.post('/api/register', async (req, res) => {
    const { fullname, email, password } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 📥 Registration attempt for: ${email}`);

    if (!fullname || !email || !password) {
        console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ Rejected: Missing fields`);
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`[${new Date().toLocaleTimeString()}] 🔐 Password successfully hashed for security`);

        const sql = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
        db.query(sql, [fullname, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.warn(`[${new Date().toLocaleTimeString()}] ❌ Rejected: Email ${email} already exists`);
                    return res.status(400).json({ error: 'Email already exists' });
                }
                console.error(`[${new Date().toLocaleTimeString()}] 🛑 Database Error:`, err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: ${email} registered (ID: ${result.insertId})`);
            res.status(201).json({ message: 'Registration successful!', userId: result.insertId });
        });
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] 💥 Critical Error:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login API Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 🔐 Login attempt for: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error(`[${new Date().toLocaleTimeString()}] 🛑 Database Error:`, err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                console.warn(`[${new Date().toLocaleTimeString()}] ❌ Login failed: Email ${email} not found`);
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.warn(`[${new Date().toLocaleTimeString()}] ❌ Login failed: Incorrect password for ${email}`);
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: ${email} logged in (ID: ${user.id})`);
            res.status(200).json({
                message: 'Login successful!',
                user: { 
                    id: user.id, 
                    fullname: user.fullname, 
                    email: user.email,
                    phone: user.phone,
                    techField: user.techField,
                    academicLevel: user.academicLevel,
                    institution: user.institution,
                    bio: user.bio,
                    linkedin: user.linkedin,
                    github: user.github,
                    skills: user.skills ? JSON.parse(user.skills) : [],
                    tools: user.tools ? JSON.parse(user.tools) : []
                }
            });
        });
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] 💥 Critical Error:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    console.log(`[${new Date().toLocaleTimeString()}] 👤 Fetching profile for ID: ${userId}`);

    const sql = 'SELECT id, fullname, email, phone, techField, academicLevel, institution, bio, linkedin, github, skills, tools FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(`[${new Date().toLocaleTimeString()}] 🛑 Database Error:`, err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ User not found: ID ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        // Parse JSON fields
        if (user.skills) user.skills = JSON.parse(user.skills);
        if (user.tools) user.tools = JSON.parse(user.tools);

        console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: Profile sent for ${user.email}`);
        res.status(200).json({ user });
    });
});

// Update User Profile Endpoint
app.post('/api/user/:id/profile', (req, res) => {
    const userId = req.params.id;
    const { phone, techField, academicLevel, institution, bio, linkedin, github, skills, tools } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 📝 Updating profile for ID: ${userId}`);

    const sql = `
        UPDATE users 
        SET phone = ?, techField = ?, academicLevel = ?, institution = ?, bio = ?, 
            linkedin = ?, github = ?, skills = ?, tools = ? 
        WHERE id = ?
    `;

    const skillsJson = JSON.stringify(skills || []);
    const toolsJson = JSON.stringify(tools || []);

    db.query(sql, [phone, techField, academicLevel, institution, bio, linkedin, github, skillsJson, toolsJson, userId], (err, result) => {
        if (err) {
            console.error(`[${new Date().toLocaleTimeString()}] 🛑 Database Error:`, err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: Profile updated for ID: ${userId}`);
        res.status(200).json({ message: 'Profile updated successfully' });
    });
});

// --- AI Job Matcher Mock Endpoints ---

// 1. Search Jobs Endpoint
app.post('/api/ai/search-jobs', (req, res) => {
    const { skills, education, preferredRole } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 🤖 AI searching jobs for role: ${preferredRole || 'Any'}`);

    // Simulate AI processing time
    setTimeout(() => {
        const mockJobs = [
            {
                id: 'job-1',
                title: 'Junior React Developer',
                company: 'TechFlow Solutions',
                location: 'Remote',
                type: 'Full-time',
                workType: 'Remote',
                matchScore: 92,
                color: 'text-blue-500',
                bg: 'bg-blue-500',
                description: 'We are looking for a junior developer with React experience to join our growing team. Great mentorship provided.'
            },
            {
                id: 'job-2',
                title: 'Frontend Engineering Intern',
                company: 'InnovateSpace',
                location: 'Nairobi, KE',
                type: 'Internship',
                workType: 'Hybrid',
                matchScore: 88,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500',
                description: 'Excellent opportunity for students or recent graduates to get hands-on experience building modern web applications.'
            },
            {
                id: 'job-3',
                title: 'UI/UX Developer Attachment',
                company: 'DesignMatrix',
                location: 'Remote',
                type: 'Attachment',
                workType: 'Remote',
                matchScore: 85,
                color: 'text-purple-500',
                bg: 'bg-purple-500',
                description: 'Join our design system team. You will help bridge the gap between design and engineering using TailwindCSS.'
            }
        ];

        console.log(`[${new Date().toLocaleTimeString()}] ✅ AI found ${mockJobs.length} matching jobs.`);
        res.status(200).json({ jobs: mockJobs });
    }, 2500); // 2.5 second simulated delay
});

// 2. AI Apply Endpoint
app.post('/api/ai/apply', (req, res) => {
    const { jobId, jobTitle, company, userProfile } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 🤖 AI generating application for ${jobTitle} at ${company}`);

    // Simulate AI thinking and drafting
    setTimeout(() => {
        // Generate a practical, non-overselling cover letter
        const skillsArray = userProfile?.skills || ['HTML', 'CSS', 'JavaScript', 'React'];
        const topSkills = skillsArray.slice(0, 3).join(', ');

        const coverLetter = `Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${jobTitle} position. As a developing software engineer, I have been focused on building practical web applications and expanding my technical foundation.

Through my projects and studies, I have gained hands-on experience with ${topSkills}. While I recognize I am still early in my career, I am a dedicated learner who values feedback and thrives in collaborative environments. I am particularly drawn to this opportunity because it aligns well with my current skill level and offers the chance to contribute while continuing to grow.

I am eager to bring my strong work ethic and current technical knowledge to your team, and I am fully committed to ramping up quickly on any specific tools or frameworks required for the role.

Thank you for considering my application.

Sincerely,
${userProfile?.fullname || 'Applicant'}`;

        console.log(`[${new Date().toLocaleTimeString()}] ✅ AI successfully generated realistic application.`);

        res.status(200).json({
            success: true,
            message: 'Application drafted successfully.',
            coverLetter: coverLetter
        });
    }, 2000); // 2 second simulated delay
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 INTERNLINK SERVER ACTIVE`);
    console.log(`URL: http://127.0.0.1:${port}\n`);
});
