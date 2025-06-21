# 🚀 CollabSpace – Real-Time Collaborative Workspace Platform

CollabSpace is a full-featured collaborative workspace platform built using the **MERN stack** with **Gitea integration**, **real-time chat via Kafka**, and **JIRA issue tracking**. It empowers development teams to seamlessly collaborate on repositories, manage tasks, communicate instantly, and track bugs — all in one unified space.

## 📌 Key Features

- 🔐 **JWT-Based Authentication**  
  Secure login and registration with user roles (Owner, Collaborator).

- 📁 **GitHub-Style Repository Viewer**  
  - View and manage repositories with a file explorer UI.  
  - Clone URL, branch selector, and file search supported.

- 💬 **Real-Time Chat (Kafka-Powered)**  
  - Repository-level chat between collaborators.  
  - Instant message delivery via Kafka streams.

- 🧑‍🤝‍🧑 **Team Collaboration**  
  - Invite collaborators by username.  
  - Repository access and communication limited to team members.

- ⚙️ **Gitea Integration**  
  - Create, update, and delete repositories using Gitea APIs.  
  - Git-like operations (commit, push, pull).  
  - File-level operations with visual interface.

- 🐞 **JIRA Bug Tracking Integration**  
  - Link JIRA boards to repositories.  
  - Assign tasks and track bugs in an agile workflow.

- 🌐 **Frontend Deployed on Vercel**  
  - Built with React.js + Tailwind CSS  
  - Clean, responsive, and intuitive UI

- 🛠️ **Backend Deployed on Render**  
  - Node.js + Express.js architecture  
  - Connected to Gitea and JIRA APIs

- ☁️ **MongoDB Atlas Database**  
  - Stores user, repository, chat, and permission data.

---

## 🏗️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React.js, Tailwind CSS |
| Backend     | Node.js, Express.js |
| Database    | MongoDB (Atlas) |
| DevOps / API | Gitea (self-hosted), JIRA Cloud |
| Messaging   | Apache Kafka |
| Auth        | JWT (JSON Web Tokens) |
| Deployment  | Vercel (frontend), Render (backend), Railway(Self-hosted Gitea Instance) | 

---

## 🔧 Features in Development

- [ ] Live Collaborative Code Editor
- [ ] JIRA Ticket Sync to Dashboard
- [ ] Repository Analytics and Contributor Stats
- [ ] Notifications Panel
- [ ] Kafka Intregation Current chat is via Socket.io

---

## 🧪 How to Run Locally

### Prerequisites

- Node.js & npm
- MongoDB (local or Atlas)
- Gitea instance (self-hosted)
- JIRA Developer Account (for API)
- Kafka setup (local/docker)

### Setup Instructions

# Clone the repo
git clone [https://github.com/piyushkashyap3247/collabspace.git](https://github.com/Piyush731/Collabspace.git)
cd collabspace

# Set up frontend
npm install
npm start

# Set up backend
cd ../backend
npm install
npm start
Environment Variables
Create a .env file in backend directories. Sample keys:


# Sample .env Backend
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
GITEA_API_URL=http://localhost:3000/api/v1
GITEA_ADMIN_TOKEN=your_gitea_token
JIRA_API_KEY=your_jira_api_key


API_URL=http://localhost:5000/api   edit in config.js in frontend

# 📸 Screenshots

🗃️ Homepage
.![homepage](https://github.com/user-attachments/assets/4b314318-f6bb-4661-91d6-6f97f6209054)

💬 Real-time Chat in Repository
![Repoview](https://github.com/user-attachments/assets/d9da0b87-a80c-420d-a5ff-ee5b53fa8142)

🧩 Task Management
![taskmanagement](https://github.com/user-attachments/assets/afc93145-5a94-4b7e-9413-0ee195ccff1f)


# 🙋‍♂️ About the Developer
Piyush Kashyap
Final year B.Tech CSE student at Graphic Era Hill University
Email: piyushkashyap3247@gmail.com
LinkedIn • GitHub

# 📃 License
This project is open-source and available under the MIT License.


# 🧭 System Architecture Overview

          ┌────────────┐       REST        ┌────────────┐
          │  Frontend  │ ────────────────► │  Backend   │
          │ (React.js) │                   │ (Node.js)  │
          └────────────┘                   └────────────┘
                │                                 │
                ▼                                 ▼
        Browser (User)                     ┌────────────┐
                                           │  Gitea API │◄──── Repo Ops
                                           └────────────┘
                                           ┌────────────┐
                                           │  Kafka     │◄──── Real-Time Chat
                                           └────────────┘
                                           ┌────────────┐
                                           │  JIRA API  │◄──── Bug/Task Tracking
                                           └────────────┘
                                           ┌────────────┐
                                           │ MongoDB    │◄──── User/Auth Data
                                           └────────────┘


# 🧑‍💻 Contributing
Contributions are welcome!
If you'd like to fix a bug, suggest a feature, or improve the documentation:

Fork this repository

Create a new branch: git checkout -b feature-name

Commit your changes: git commit -m 'Add some feature'

Push to your branch: git push origin feature-name

Submit a pull request

# 🛠️ Known Issues
In Repository View page, Repository permissions are laoding in delayed manner after refresh.

Limited JIRA role mapping to file level.

File editor is basic — does not support syntax highlighting yet.

# 📞 Contact
For any issues or questions, feel free to connect:

Email: piyushkashyap3247@gmail.com

LinkedIn: linkedin.com/in/piyush-kashyap731

GitHub: github.com/piyushkashyap3247
