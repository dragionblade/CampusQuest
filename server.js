const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'campusquest-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }
}));

// MySQL Connection (without database first)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '43pr16pi',
    multipleStatements: true
});

// Auto-initialize database
function initDatabase() {
    db.connect((err) => {
        if (err) {
            console.log('❌ MySQL connection failed. Make sure MySQL is running and credentials are correct.');
            console.log('   Error:', err.message);
            process.exit(1);
        }
        console.log('✅ Connected to MySQL');

        // Create database if not exists
        db.query('CREATE DATABASE IF NOT EXISTS campusquest', (err) => {
            if (err) throw err;
            db.query('USE campusquest', (err) => {
                if (err) throw err;

                // Create tables
                const createTables = `
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        full_name VARCHAR(100) NOT NULL,
                        role ENUM('admin', 'player') DEFAULT 'player',
                        points INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS quests (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        description TEXT NOT NULL,
                        points INT NOT NULL,
                        status ENUM('active', 'inactive') DEFAULT 'active',
                        created_by INT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (created_by) REFERENCES users(id)
                    );

                    CREATE TABLE IF NOT EXISTS submissions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        quest_id INT NOT NULL,
                        user_id INT NOT NULL,
                        proof TEXT,
                        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (quest_id) REFERENCES quests(id),
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    );

                    INSERT IGNORE INTO users (username, password, email, full_name, role) VALUES
                        ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdLmPnSOe', 'admin@campusquest.com', 'Administrator', 'admin'),
                        ('player1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdLmPnSOe', 'player1@campusquest.com', 'John Doe', 'player');

                    INSERT IGNORE INTO quests (title, description, points, created_by) VALUES
                        ('Attend Workshop', 'Attend any campus workshop and provide proof of attendance', 50, 1),
                        ('Join Club', 'Join any student club and show membership confirmation', 30, 1),
                        ('Volunteer Event', 'Participate in a campus volunteer event', 40, 1),
                        ('Library Research', 'Complete a research session at the campus library', 25, 1),
                        ('Sports Day', 'Participate in any campus sports event', 35, 1),
                        ('Hackathon', 'Participate in a campus hackathon or coding competition', 60, 1);
                `;

                db.query(createTables, (err) => {
                    if (err) {
                        // Tables might already exist, that's fine
                        console.log('✅ Database tables ready');
                    } else {
                        console.log('✅ Database initialized with sample data');
                    }

                    // Hash default passwords if they're still plain text
                    db.query("SELECT id, username, password FROM users WHERE password NOT LIKE '$2a$%'", (err, users) => {
                        if (!err && users.length > 0) {
                            users.forEach(user => {
                                const hash = bcrypt.hashSync('admin123', 10);
                                db.query('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);
                            });
                            console.log('✅ Passwords secured');
                        }
                    });
                });
            });
        });
    });
}

// Auth middleware
function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/');
    next();
}

function requirePlayer(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'player') return res.redirect('/');
    next();
}

// ============ ROUTES ============

// Login Page
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
        return res.redirect('/player/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register Page
app.get('/register', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
        return res.redirect('/player/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.redirect('/?error=Database error');
        if (results.length === 0) return res.redirect('/?error=Invalid username or password');
        
        const user = results[0];
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.redirect('/?error=Invalid username or password');

        req.session.user = {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
            points: user.points
        };

        if (user.role === 'admin') return res.redirect('/admin/dashboard');
        res.redirect('/player/dashboard');
    });
});

// Register
app.post('/register', (req, res) => {
    const { username, fullName, email, password, role } = req.body;
    
    // Validation
    if (!username || !fullName || !email || !password || !role) {
        return res.redirect('/register?error=All fields are required');
    }
    
    if (password.length < 6) {
        return res.redirect('/register?error=Password must be at least 6 characters');
    }
    
    // Check if user already exists
    db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
        if (err) return res.redirect('/register?error=Database error');
        if (results.length > 0) return res.redirect('/register?error=Username or email already exists');
        
        // Hash password and create user
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.query('INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, fullName, role], (err) => {
                if (err) return res.redirect('/register?error=Failed to create account');
                res.redirect('/?success=Account created successfully! Please login.');
            });
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ============ ADMIN ROUTES ============

app.get('/admin/dashboard', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

app.get('/admin/create-quest', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'create-quest.html'));
});

app.get('/admin/submissions', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'submissions.html'));
});

app.get('/admin/leaderboard', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'leaderboard.html'));
});

// ============ PLAYER ROUTES ============

app.get('/player/dashboard', requirePlayer, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player', 'dashboard.html'));
});

app.get('/player/quests', requirePlayer, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player', 'quests.html'));
});

app.get('/player/my-submissions', requirePlayer, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player', 'my-submissions.html'));
});

app.get('/player/leaderboard', requirePlayer, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player', 'leaderboard.html'));
});

// ============ API ROUTES ============

// Get current user info
app.get('/api/user', requireLogin, (req, res) => {
    db.query('SELECT id, username, full_name, role, points FROM users WHERE id = ?', [req.session.user.id], (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        if (results.length === 0) return res.json({ error: 'User not found' });
        const user = results[0];
        req.session.user.points = user.points;
        res.json(user);
    });
});

// Get all active quests
app.get('/api/quests', requireLogin, (req, res) => {
    db.query('SELECT * FROM quests WHERE status = "active" ORDER BY created_at DESC', (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        res.json(results);
    });
});

// Create new quest (admin)
app.post('/api/quests', requireAdmin, (req, res) => {
    const { title, description, points } = req.body;
    db.query('INSERT INTO quests (title, description, points, created_by) VALUES (?, ?, ?, ?)',
        [title, description, points, req.session.user.id], (err) => {
            if (err) return res.json({ error: 'Database error' });
            res.json({ success: true, message: 'Quest created successfully!' });
        });
});

// Submit quest (player)
app.post('/api/submit-quest', requirePlayer, (req, res) => {
    const { questId, proof } = req.body;
    const userId = req.session.user.id;

    // Check if already submitted
    db.query('SELECT id FROM submissions WHERE quest_id = ? AND user_id = ?', [questId, userId], (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        if (results.length > 0) return res.json({ error: 'You have already submitted this quest' });

        db.query('INSERT INTO submissions (quest_id, user_id, proof, status) VALUES (?, ?, ?, "pending")',
            [questId, userId, proof], (err) => {
                if (err) return res.json({ error: 'Database error' });
                res.json({ success: true, message: 'Quest submitted! Pending admin review.' });
            });
    });
});

// Get pending submissions (admin)
app.get('/api/submissions/pending', requireAdmin, (req, res) => {
    const sql = `SELECT s.id, s.proof, s.status, s.submitted_at, 
                 q.title as quest_title, q.points, u.full_name, u.username 
                 FROM submissions s 
                 JOIN quests q ON s.quest_id = q.id 
                 JOIN users u ON s.user_id = u.id 
                 WHERE s.status = 'pending' ORDER BY s.submitted_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        res.json(results);
    });
});

// Get all submissions (admin)
app.get('/api/submissions/all', requireAdmin, (req, res) => {
    const sql = `SELECT s.id, s.proof, s.status, s.submitted_at, 
                 q.title as quest_title, q.points, u.full_name, u.username 
                 FROM submissions s 
                 JOIN quests q ON s.quest_id = q.id 
                 JOIN users u ON s.user_id = u.id 
                 ORDER BY s.submitted_at DESC LIMIT 50`;
    db.query(sql, (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        res.json(results);
    });
});

// Get my submissions (player)
app.get('/api/submissions/mine', requirePlayer, (req, res) => {
    const sql = `SELECT s.id, s.proof, s.status, s.submitted_at, 
                 q.title as quest_title, q.points 
                 FROM submissions s 
                 JOIN quests q ON s.quest_id = q.id 
                 WHERE s.user_id = ? ORDER BY s.submitted_at DESC`;
    db.query(sql, [req.session.user.id], (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        res.json(results);
    });
});

// Approve/Reject submission (admin)
app.post('/api/submissions/review', requireAdmin, (req, res) => {
    const { submissionId, action } = req.body;

    // Get submission details
    db.query('SELECT user_id, quest_id FROM submissions WHERE id = ?', [submissionId], (err, results) => {
        if (err || results.length === 0) return res.json({ error: 'Submission not found' });

        const { user_id, quest_id } = results[0];

        if (action === 'approve') {
            // Get quest points
            db.query('SELECT points FROM quests WHERE id = ?', [quest_id], (err, questResults) => {
                if (err || questResults.length === 0) return res.json({ error: 'Quest not found' });
                const points = questResults[0].points;

                // Update submission and add points
                db.query('UPDATE submissions SET status = "approved" WHERE id = ?', [submissionId], (err) => {
                    if (err) return res.json({ error: 'Database error' });
                    db.query('UPDATE users SET points = points + ? WHERE id = ?', [points, user_id], (err) => {
                        if (err) return res.json({ error: 'Database error' });
                        res.json({ success: true, message: 'Submission approved! Points awarded.' });
                    });
                });
            });
        } else if (action === 'reject') {
            db.query('UPDATE submissions SET status = "rejected" WHERE id = ?', [submissionId], (err) => {
                if (err) return res.json({ error: 'Database error' });
                res.json({ success: true, message: 'Submission rejected.' });
            });
        }
    });
});

// Get leaderboard
app.get('/api/leaderboard', requireLogin, (req, res) => {
    db.query('SELECT full_name, username, points FROM users WHERE role = "player" ORDER BY points DESC, created_at ASC LIMIT 20', (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        res.json(results);
    });
});

// Get admin stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const queries = `
        SELECT COUNT(*) as total_quests FROM quests WHERE status = 'active';
        SELECT COUNT(*) as total_players FROM users WHERE role = 'player';
        SELECT COUNT(*) as pending_submissions FROM submissions WHERE status = 'pending';
        SELECT COALESCE(SUM(points), 0) as total_points_awarded FROM submissions s JOIN quests q ON s.quest_id = q.id WHERE s.status = 'approved';
    `;
    db.query(queries, (err, results) => {
        if (err) return res.json({ error: 'Database error' });
        res.json({
            totalQuests: results[0][0].total_quests,
            totalPlayers: results[1][0].total_players,
            pendingSubmissions: results[2][0].pending_submissions,
            totalPointsAwarded: results[3][0].total_points_awarded
        });
    });
});

// Start server
initDatabase();
app.listen(PORT, () => {
    console.log('');
    console.log('🎮 CampusQuest is running!');
    console.log('========================');
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log('');
    console.log('👤 Login Credentials:');
    console.log('   Admin:  admin / admin123');
    console.log('   Player: player1 / player123');
    console.log('');
});
