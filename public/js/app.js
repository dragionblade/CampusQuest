// CampusQuest Frontend JavaScript

const API = {
    get: async (url) => {
        const res = await fetch(url);
        if (res.status === 401 || res.status === 302) { window.location.href = '/'; return null; }
        return res.json();
    },
    post: async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.status === 401 || res.status === 302) { window.location.href = '/'; return null; }
        return res.json();
    }
};

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="loading">Loading</div>';
}

function showError(containerId, msg) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div class="no-data"><div class="icon">⚠️</div><h3>Error</h3><p>${msg}</p></div>`;
}

function showNoData(containerId, icon, title, desc, actions) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div class="no-data"><div class="icon">${icon}</div><h3>${title}</h3><p>${desc}</p>${actions ? '<div class="actions">' + actions + '</div>' : ''}</div>`;
}

// Load user info into header
async function loadUserInfo() {
    const user = await API.get('/api/user');
    if (!user || user.error) return null;
    
    const nameEl = document.getElementById('userName');
    const pointsEl = document.getElementById('userPoints');
    if (nameEl) nameEl.textContent = user.full_name;
    if (pointsEl) pointsEl.textContent = user.points + ' pts';
    
    return user;
}

// Load quests
async function loadQuests(containerId) {
    showLoading(containerId);
    const quests = await API.get('/api/quests');
    if (!quests || quests.error) return showError(containerId, quests?.error || 'Failed to load quests');
    
    if (quests.length === 0) {
        return showNoData(containerId, '🎯', 'No Quests Available', 'Check back later for new quests!');
    }
    
    const el = document.getElementById(containerId);
    el.innerHTML = quests.map(q => `
        <div class="quest-card">
            <h3>${q.title}</h3>
            <p>${q.description}</p>
            <div class="quest-footer">
                <span class="quest-points">${q.points} points</span>
                <button class="btn btn-primary" onclick="openSubmitModal(${q.id}, '${q.title.replace(/'/g, "\\'")}', ${q.points})">Submit Quest</button>
            </div>
        </div>
    `).join('');
}

// Submit quest modal
function openSubmitModal(questId, questTitle, questPoints) {
    const modal = document.createElement('div');
    modal.id = 'submitModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;';
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:16px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
            <h2 style="color:#667eea;margin-bottom:8px;">Submit Quest</h2>
            <p style="color:#888;margin-bottom:20px;">${questTitle} — ${questPoints} points</p>
            <div class="form-group">
                <label>Proof of Completion</label>
                <textarea id="proofInput" rows="4" placeholder="Describe how you completed this quest or provide a link as proof..." required></textarea>
            </div>
            <div id="submitMsg" style="display:none;margin-bottom:16px;"></div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="submitQuest(${questId})">Submit</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitQuest(questId) {
    const proof = document.getElementById('proofInput').value.trim();
    if (!proof) { alert('Please provide proof of completion'); return; }
    
    const result = await API.post('/api/submit-quest', { questId, proof });
    const msgEl = document.getElementById('submitMsg');
    
    if (result.error) {
        msgEl.className = 'error';
        msgEl.textContent = result.error;
        msgEl.style.display = 'block';
    } else {
        msgEl.className = 'success';
        msgEl.textContent = result.message;
        msgEl.style.display = 'block';
        setTimeout(() => { closeModal(); loadQuests('questsContainer'); }, 1500);
    }
}

function closeModal() {
    const modal = document.getElementById('submitModal');
    if (modal) modal.remove();
}

// Load leaderboard
async function loadLeaderboard(containerId) {
    showLoading(containerId);
    const entries = await API.get('/api/leaderboard');
    if (!entries || entries.error) return showError(containerId, entries?.error || 'Failed to load leaderboard');
    
    if (entries.length === 0) {
        return showNoData(containerId, '🏆', 'No Leaderboard Data', 'Complete quests to appear on the leaderboard!');
    }
    
    const el = document.getElementById(containerId);
    el.innerHTML = `
        <div class="leaderboard-table">
            <div class="table-header">
                <div>Rank</div>
                <div>Player</div>
                <div style="text-align:right">Points</div>
            </div>
            ${entries.map((e, i) => {
                const rank = i + 1;
                let rowClass = '';
                let rankDisplay = rank;
                if (rank === 1) { rowClass = 'first'; rankDisplay = '🥇'; }
                else if (rank === 2) { rowClass = 'second'; rankDisplay = '🥈'; }
                else if (rank === 3) { rowClass = 'third'; rankDisplay = '🥉'; }
                return `
                    <div class="table-row ${rowClass}">
                        <div class="rank-col">${rankDisplay}</div>
                        <div class="name-col">${e.full_name} <small>@${e.username}</small></div>
                        <div class="points-col"><span class="leaderboard-points">${e.points}</span></div>
                    </div>`;
            }).join('')}
        </div>
    `;
}

// Load pending submissions (admin)
async function loadPendingSubmissions(containerId) {
    showLoading(containerId);
    const submissions = await API.get('/api/submissions/pending');
    if (!submissions || submissions.error) return showError(containerId, submissions?.error || 'Failed to load submissions');
    
    if (submissions.length === 0) {
        return showNoData(containerId, '📝', 'No Pending Submissions', 'All caught up!', 
            '<a href="/admin/create-quest" class="btn btn-primary">Create New Quest</a>');
    }
    
    const el = document.getElementById(containerId);
    el.innerHTML = submissions.map(s => `
        <div class="submission-card pending">
            <div class="submission-header">
                <h3>${s.quest_title}</h3>
                <div class="submission-meta">
                    <span class="status-badge pending">⏳ Pending</span>
                    <span class="points-badge">${s.points} pts</span>
                </div>
            </div>
            <p><strong>Student:</strong> ${s.full_name} (@${s.username})</p>
            <p><strong>Submitted:</strong> ${formatDate(s.submitted_at)}</p>
            <div class="proof-content"><strong>Proof:</strong> ${s.proof}</div>
            <div class="submission-actions">
                <button class="btn btn-success" onclick="reviewSubmission(${s.id}, 'approve')">✅ Approve</button>
                <button class="btn btn-danger" onclick="reviewSubmission(${s.id}, 'reject')">❌ Reject</button>
            </div>
        </div>
    `).join('');
}

async function reviewSubmission(submissionId, action) {
    const confirmMsg = action === 'approve' ? 'Approve this submission?' : 'Reject this submission?';
    if (!confirm(confirmMsg)) return;
    
    const result = await API.post('/api/submissions/review', { submissionId, action });
    if (result.success) {
        loadPendingSubmissions('submissionsContainer');
    } else {
        alert(result.error || 'Failed to review submission');
    }
}

// Load my submissions (player)
async function loadMySubmissions(containerId) {
    showLoading(containerId);
    const submissions = await API.get('/api/submissions/mine');
    if (!submissions || submissions.error) return showError(containerId, submissions?.error || 'Failed to load submissions');
    
    if (submissions.length === 0) {
        return showNoData(containerId, '📝', 'No Submissions Yet', 'Start completing quests to see your submissions here!',
            '<a href="/player/quests" class="btn btn-primary">Browse Quests</a>');
    }
    
    const el = document.getElementById(containerId);
    el.innerHTML = submissions.map(s => {
        let notice = '';
        if (s.status === 'approved') notice = '<div class="notice notice-approval">🎉 Your quest was approved! Points have been added to your account.</div>';
        else if (s.status === 'pending') notice = '<div class="notice notice-pending">⏳ Your submission is being reviewed by administrators.</div>';
        else notice = '<div class="notice notice-rejection">❌ Your submission was rejected. Please review the requirements and try again.</div>';
        
        return `
            <div class="submission-card ${s.status}">
                <div class="submission-header">
                    <h3>${s.quest_title}</h3>
                    <div class="submission-meta">
                        <span class="status-badge ${s.status}">${s.status === 'approved' ? '✅ Approved' : s.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}</span>
                        <span class="points-badge">${s.points} pts</span>
                    </div>
                </div>
                <p><strong>Submitted:</strong> ${formatDate(s.submitted_at)}</p>
                <div class="proof-content"><strong>Your Proof:</strong> ${s.proof}</div>
                ${notice}
            </div>
        `;
    }).join('');
}

// Load admin stats
async function loadAdminStats() {
    const stats = await API.get('/api/admin/stats');
    if (!stats || stats.error) return;
    
    const el = document.getElementById('statsGrid');
    if (el) el.innerHTML = `
        <div class="stat-card"><h3>Active Quests</h3><p>${stats.totalQuests}</p></div>
        <div class="stat-card"><h3>Total Players</h3><p>${stats.totalPlayers}</p></div>
        <div class="stat-card"><h3>Pending Reviews</h3><p>${stats.pendingSubmissions}</p></div>
        <div class="stat-card"><h3>Points Awarded</h3><p>${stats.totalPointsAwarded}</p></div>
    `;
}

// Create quest (admin)
async function createQuest() {
    const title = document.getElementById('questTitle').value.trim();
    const description = document.getElementById('questDesc').value.trim();
    const points = parseInt(document.getElementById('questPoints').value);
    
    if (!title || !description || !points) {
        alert('Please fill in all fields');
        return;
    }
    
    const result = await API.post('/api/quests', { title, description, points });
    const msgEl = document.getElementById('questMsg');
    
    if (result.error) {
        msgEl.className = 'error';
        msgEl.textContent = result.error;
    } else {
        msgEl.className = 'success';
        msgEl.textContent = result.message;
        document.getElementById('questTitle').value = '';
        document.getElementById('questDesc').value = '';
        document.getElementById('questPoints').value = '';
    }
    msgEl.style.display = 'block';
}
