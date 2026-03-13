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
        const sql = `
            SELECT u.*, ai.technical_field, ai.academic_level, ai.institution, 
                   jp.opportunity_type, jp.work_preference, jp.relocation
            FROM users u
            LEFT JOIN user_academic_info ai ON u.id = ai.user_id
            LEFT JOIN user_job_preferences jp ON u.id = jp.user_id
            WHERE u.email = ?
        `;
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

            // Fetch Skills and Tools
            const skillsSql = 'SELECT skill_name FROM user_skills WHERE user_id = ?';
            const toolsSql = 'SELECT tool_name FROM user_tools WHERE user_id = ?';

            db.query(skillsSql, [user.id], (sErr, sResults) => {
                db.query(toolsSql, [user.id], (tErr, tResults) => {
                    console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: ${email} logged in (ID: ${user.id})`);
                    res.status(200).json({
                        message: 'Login successful!',
                        user: { 
                            id: user.id, 
                            fullname: user.fullname, 
                            email: user.email,
                            phone: user.phone,
                            technical_field: user.technical_field,
                            academic_level: user.academic_level,
                            institution: user.institution,
                            bio: user.bio,
                            linkedin: user.linkedin,
                            github: user.github,
                            opportunity_type: user.opportunity_type,
                            work_preference: user.work_preference,
                            relocation: user.relocation,
                            skills: sResults.map(s => s.skill_name),
                            tools: tResults.map(t => t.tool_name)
                        }
                    });
                });
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

    const sql = `
        SELECT u.*, ai.technical_field, ai.academic_level, ai.institution, 
               jp.opportunity_type, jp.work_preference, jp.relocation
        FROM users u
        LEFT JOIN user_academic_info ai ON u.id = ai.user_id
        LEFT JOIN user_job_preferences jp ON u.id = jp.user_id
        WHERE u.id = ?
    `;
    
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
        
        // Fetch Skills and Tools
        const skillsSql = 'SELECT skill_name FROM user_skills WHERE user_id = ?';
        const toolsSql = 'SELECT tool_name FROM user_tools WHERE user_id = ?';

        db.query(skillsSql, [userId], (sErr, sResults) => {
            db.query(toolsSql, [userId], (tErr, tResults) => {
                user.skills = sResults.map(s => s.skill_name);
                user.tools = tResults.map(t => t.tool_name);
                
                console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: Profile sent for ${user.email}`);
                res.status(200).json({ user });
            });
        });
    });
});

// Update User Profile Endpoint
app.post('/api/user/:id/profile', (req, res) => {
    const userId = req.params.id;
    const { phone, technical_field, academic_level, institution, bio, linkedin, github, opportunity_type, work_preference, relocation, skills, tools } = req.body;
    
    console.log(`[${new Date().toLocaleTimeString()}] 📝 Updating profile for ID: ${userId}`);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: 'Transaction failed' });

        // 1. Update Core Profile
        const userSql = `UPDATE users SET phone = ?, bio = ?, linkedin = ?, github = ? WHERE id = ?`;
        db.query(userSql, [phone, bio, linkedin, github, userId], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: 'User update failed' }));

            // 2. Update Academic Info (Insert or Update)
            const academicSql = `INSERT INTO user_academic_info (user_id, technical_field, academic_level, institution) 
                                VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
                                technical_field = VALUES(technical_field), academic_level = VALUES(academic_level), institution = VALUES(institution)`;
            db.query(academicSql, [userId, technical_field, academic_level, institution], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'Academic update failed' }));

                // 3. Update Job Preferences
                const prefSql = `INSERT INTO user_job_preferences (user_id, opportunity_type, work_preference, relocation) 
                                VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
                                opportunity_type = VALUES(opportunity_type), work_preference = VALUES(work_preference), relocation = VALUES(relocation)`;
                db.query(prefSql, [userId, opportunity_type, work_preference, relocation], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Prefs update failed' }));

                    // 4. Update Skills (Delete then Insert)
                    db.query('DELETE FROM user_skills WHERE user_id = ?', [userId], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: 'Skill clear failed' }));
                        
                        if (skills && skills.length > 0) {
                            const skillsValues = skills.map(s => [userId, s]);
                            db.query('INSERT INTO user_skills (user_id, skill_name) VALUES ?', [skillsValues], (err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: 'Skill insert failed' }));
                                updateTools();
                            });
                        } else {
                            updateTools();
                        }
                    });

                    function updateTools() {
                        // 5. Update Tools (Delete then Insert)
                        db.query('DELETE FROM user_tools WHERE user_id = ?', [userId], (err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: 'Tool clear failed' }));
                            
                            if (tools && tools.length > 0) {
                                const toolsValues = tools.map(t => [userId, t]);
                                db.query('INSERT INTO user_tools (user_id, tool_name) VALUES ?', [toolsValues], (err) => {
                                    if (err) return db.rollback(() => res.status(500).json({ error: 'Tool insert failed' }));
                                    commit();
                                });
                            } else {
                                commit();
                            }
                        });
                    }

                    function commit() {
                        db.commit((err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                            console.log(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: Profile transaction completed for ID: ${userId}`);
                            res.status(200).json({ message: 'Profile updated successfully' });
                        });
                    }
                });
            });
        });
    });
});

// AI Search Jobs Endpoint
app.post('/api/ai/search-jobs', (req, res) => {
    const { preferredRole } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 🤖 AI searching database for role: ${preferredRole || 'Any'}`);

    // Real DB Query
    const sql = `
        SELECT *, 
               title as title, company as company, location as location, 
               type as type, work_type as workType, description as description,
               bg_color as bg, text_color as color
        FROM opportunities
        WHERE title LIKE ? OR description LIKE ?
    `;
    const searchVal = `%${preferredRole || ''}%`;
    
    db.query(sql, [searchVal, searchVal], (err, results) => {
        if (err) return res.status(500).json({ error: 'Job search failed' });

        // Add a mock matchScore for the UI UX
        const jobsWithScores = results.map(job => ({
            ...job,
            matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85
        }));

        console.log(`[${new Date().toLocaleTimeString()}] ✅ Found ${jobsWithScores.length} real matching jobs in DB.`);
        res.status(200).json({ jobs: jobsWithScores });
    });
});

// AI Apply Endpoint
app.post('/api/ai/apply', (req, res) => {
    const { userId, jobId, jobTitle, company, userProfile } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] 🤖 AI generating application for ${jobTitle} at ${company}`);

    // Generate cover letter
    const skillsArray = userProfile?.skills || [];
    const topSkills = skillsArray.slice(0, 3).join(', ');

    const coverLetter = `Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${jobTitle} position... (AI Generated)`; // Shortened for logic

    // Save Application to DB
    const sql = 'INSERT INTO applications (user_id, opportunity_id, cover_letter) VALUES (?, ?, ?)';
    db.query(sql, [userId, jobId, coverLetter], (err, result) => {
        if (err) return res.status(500).json({ error: 'Application submission failed' });

        console.log(`[${new Date().toLocaleTimeString()}] ✅ Application recorded in DB (ID: ${result.insertId})`);
        res.status(200).json({
            success: true,
            coverLetter: coverLetter
        });
    });
});

// New Endpoints for Applications and Notifications
app.get('/api/user/:id/applications', (req, res) => {
    const userId = req.params.id;
    const sql = `
        SELECT a.*, o.title, o.company, o.location
        FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.user_id = ?
        ORDER BY a.applied_at DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch applications' });
        res.status(200).json({ applications: results });
    });
});

app.get('/api/user/:id/notifications', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
        res.status(200).json({ notifications: results });
    });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 INTERNLINK SERVER ACTIVE`);
    console.log(`URL: http://127.0.0.1:${port}\n`);
});
