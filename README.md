# 📹 MeetSpace - Secure Video Calling Platform

**MeetSpace** is a **Full-Stack video conferencing Web-Application** that enables users to **securely host and join virtual meetings** with built-in **Real-time chat functionality**. The platform includes features like **User Authentication**, **Meeting History Tracking**, and **Live Communication** using **WebRTC** and **Socket.io**. The frontend is developed with **React** and styled using **Material UI**, ensuring a **clean**, **intuitive**, and **responsive** user experience.

## 🌐 Deployment Link
🚀 **[Live Demo](https://meetspacefrontend.onrender.com)**  
_(Click the link above to explore the live application!)_

## 🎯 Objectives and Scope
**Objectives:**
- Browser-based multi-user video calls
- Real-time messaging
- Secure JWT login/signup
- Store & display meeting history

**Scope:**
- Multi-user P2P meetings
- Private user history
- Modular, scalable architecture
- Desktop-first responsive design

## ✨ Key Features
- 🔒 JWT-based authentication (login/signup)
- 📞 Real-time video calling with WebRTC + Socket.IO
- 💬 Instant chat messages during meetings
- 🗓 View personal meeting history
- 🎨 Material UI (MUI) styling + custom CSS
- 🛠 Modular backend with clear controller & route structure


## 🛠️ Tech Stack

| Frontend     | Backend        | Real-time | Database |
|--------------|----------------|-----------|----------|
| React.js     | Node.js        | Socket.io | MongoDB  |
| Context API  | Express.js     |           | Mongoose |
| Material UI  | JWT, bcrypt    |           |          |


## ⚙️ Setup Instructions

### 🔧 Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
   
2. Install dependencies:
   ```bash
   npm install
   ```
   
4. Create a .env file and add:
    ```bash
    Mongo_URI=your_mongodb_uri
    ```

5. Run the backend server:
   ```bash
   npm run dev
   ```
   

### 💻 Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
   
2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Create a .env file and add:
   ```bash
   REACT_APP_UNSPLASH_KEY=your_unsplash_api_key
   ```
   
4. Run the frontend development server:
   ```bash
   npm start
   ```
   
💡The Frontend runs on http://localhost:3000 and Backend runs on http://localhost:8000


## 🔒 Security Practices

- Sensitive keys (MongoDB URI, API keys) are placed in .env and excluded via .gitignore
- Token-based authentication using JWT
- GitHub secret scanning was triggered; keys have been regenerated and removed from source

## 📎 Appendices and References
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/)
- [Socket.IO Docs](https://socket.io/docs/)
- [Material UI](https://mui.com/)
- [MongoDB Docs](https://www.mongodb.com/docs/)


## 🙋‍♂️ Contact Details

**Santhosh Korra**  
📧 **Email**: santhoshnaik218@gmail.com  
🌐 **LinkedIn**: [linkedin.com/in/santhosh-chauhan](https://www.linkedin.com/in/santhosh-chauhan/)


## 🤝 Collaboration & Connect

I'm always open to:

- 🚀 Collaborating on meaningful full-stack projects  
- 🧠 Learning from open-source contributors  
- 💼 Networking with developers, mentors, and recruiters  
- 🗣️ Sharing and discussing new ideas and tech

Feel free to connect with me on LinkedIn!
