Getting Started with the project(Steps)
1. Go to main project repository.
     Click the Fork button.
     This will create a copy of the repository in your GitHub account.
2. Now, git clone https://github.com/<your_username>/<your_personal_repo_name>.git
3. Make ,commit and push the changes to the code in your forked repository.
      git add .
      git commit -m "Your commit message"
      git push origin main
4. Creating a Pull request (Important)
      Go to your forked repository on GitHub.
      Click the New pull request button.
      Select the base repository (original repository) and the head repository (your fork).
      Add a title and description to your pull request.
      Click Create pull request.

Install the Dependencies after cloning the repository
     npm install axios react-router-dom
     npm install react-scroll tailwindcss framer-motion
     npm install express mongoose bcrypt jsonwebtoken dotenv body-parser cors

Run the backend server using the command
     node server.js

Run the frontend server using the command
     npm run dev

Open the frontend server in the browser using the command
     npm start
