# CampusQuest

A gamified web-based platform designed to enhance student engagement in extracurricular activities and campus events.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MySQL (auto-initialized)

## Project Structure

```
campusQuest/
├── server.js              # Express backend with all API routes
├── package.json           # Node.js dependencies
├── README.md
└── public/
    ├── index.html          # Login page
    ├── css/
    │   └── style.css       # All styles
    ├── js/
    │   └── app.js          # Frontend JavaScript (API calls, UI logic)
    ├── admin/
    │   ├── dashboard.html
    │   ├── create-quest.html
    │   ├── submissions.html
    │   └── leaderboard.html
    └── player/
        ├── dashboard.html
        ├── quests.html
        ├── my-submissions.html
        └── leaderboard.html
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- MySQL running on localhost

### Install & Run

```bash
cd campusQuest
npm install
node server.js
```

Open **http://localhost:3000** in your browser.

### Database

The database auto-initializes on first run. Just make sure MySQL is running with:
- Host: `localhost`
- User: `root`
- Password: *(empty by default)*

If your MySQL password is different, edit the `db` config in `server.js`.

### Demo Accounts

- **Admin**: `admin` / `admin123`
- **Player**: `player1` / `player123`

## Features

- **Quest System**: Campus events and activities structured as quests
- **Scoring and Leaderboard**: Points system with competitive rankings
- **Admin Dashboard**: Create quests, review submissions, view stats
- **Player Dashboard**: Browse quests, submit completions, track progress
- **Submission Review**: Admins approve/reject with automatic point awarding
- **Beautiful UI**: Modern responsive design with animations
