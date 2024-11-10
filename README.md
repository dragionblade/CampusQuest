# CampusQuest

CampusQuest is a gamified web-based platform designed to enhance student engagement in extracurricular activities and campus events. This platform incentivizes students to participate in various campus activities through a rewards and recognition system. Students can complete activities (known as "quests"), earn points, and compete on a leaderboard to be recognized as top contributors to campus life. By fostering healthy competition, CampusQuest aims to create a more vibrant and involved campus community.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Quest System**: Campus events and activities are structured as quests. Students select quests, complete tasks, and submit proof for verification.
- **Scoring and Leaderboard**: Students earn points upon quest completion, ranking on a leaderboard to encourage healthy competition.
- **Recognition**: Top students receive honor titles, which are reset each year to allow fair competition.
- **Admin Dashboard**: Admins can manage quests, verify submissions, and award bonus points.
- **Player Dashboard**: Players can view available quests, check their profile, and track leaderboard standings.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Java (Servlets and JSP), Apache Tomcat
- **Database**: MySQL

## Project Structure

```plaintext
CampusQuest/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── DatabaseConnection.java
│   │   │   ├── LoginServlet.java
│   │   └── webapp/
│   │       ├── WEB-INF/
│   │       │   └── web.xml
│   │       ├── login.jsp
│   │       ├── playerDashboard.jsp
│   │       ├── quests.jsp
│   │       ├── quiz.jsp
│   │       ├── leaderboard.jsp
│   │       └── history.jsp
└── lib/
    └── mysql-connector-java-x.x.xx.jar

