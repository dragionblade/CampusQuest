CampusQuest
CampusQuest is a gamified web-based platform designed to enhance student engagement in extracurricular activities and campus events. This platform incentivizes students to participate in various campus activities through a rewards and recognition system. Students can complete activities (known as "quests"), earn points, and compete on a leaderboard to be recognized as top contributors to campus life. By fostering healthy competition, CampusQuest aims to create a more vibrant and involved campus community.

Table of Contents
Features
Tech Stack
Project Structure
Getting Started
Database Setup
Usage
Screenshots
Contributing
License
Features
Quest System: Campus events and activities are structured as quests. Students select quests, complete tasks, and submit proof for verification.
Scoring and Leaderboard: Students earn points upon quest completion, ranking on a leaderboard to encourage healthy competition.
Recognition: Top students receive honor titles, which are reset each year to allow fair competition.
Admin Dashboard: Admins can manage quests, verify submissions, and award bonus points.
Player Dashboard: Players can view available quests, check their profile, and track leaderboard standings.
Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Java (Servlets and JSP), Apache Tomcat
Database: MySQL
Project Structure
plaintext
Copy code
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
Getting Started
Prerequisites
Java JDK 8 or newer
Apache Tomcat (8.5 or newer)
MySQL (for database)
Visual Studio Code with the following extensions:
Java Extension Pack
Tomcat for Java
SQLTools (optional)
Setup Instructions
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/CampusQuest.git
cd CampusQuest
Configure MySQL:

Set up a MySQL database using the SQL scripts in the Database Setup section.
Configure Database Connection:

Update DatabaseConnection.java with your MySQL credentials.
Run on Tomcat:

Open the project in VS Code and deploy on Tomcat via the Tomcat extension.
Access the application at http://localhost:8080/CampusQuest/login.jsp.
Database Setup
Create the Database:

sql
Copy code
CREATE DATABASE CampusQuest;
USE CampusQuest;
Create Tables: Run the following SQL scripts to set up required tables.

sql
Copy code
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    college_id VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('player', 'admin'),
    points INT DEFAULT 0
);

CREATE TABLE Quests (
    quest_id INT AUTO_INCREMENT PRIMARY KEY,
    quest_name VARCHAR(100),
    base_points INT,
    description TEXT
);

CREATE TABLE QuestCompletion (
    completion_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quest_id INT,
    points_earned INT,
    proof_link VARCHAR(255),
    status ENUM('pending', 'verified')
);
Insert Sample Data (optional):

sql
Copy code
INSERT INTO Users (college_id, password_hash, role, points) VALUES
    ('12345', 'password1', 'player', 0),
    ('67890', 'password2', 'admin', 0);
Usage
Login: Access the application through login.jsp.
Player Actions:
Browse and select quests.
Check the leaderboard.
Submit quest completion proof.
Admin Actions:
Approve or verify quest completions.
Manage quests and bonus points.
Screenshots
Feature	Screenshot
Login Page	
Player Dashboard	
Quests List	
Leaderboard	
Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch.
Commit your changes.
Push the branch and open a Pull Request.
