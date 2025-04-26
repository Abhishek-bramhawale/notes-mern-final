# Notes App - MERN Stack Application

A full-stack notes application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to 
-create
-read
-update
and delete notes with user authentication.

## Live Demo

Check website at: [https://notes-mern-final.vercel.app/](https://notes-mern-final.vercel.app/)

## Features

- User Authentication (Login/Register)
- Create, Read, Update, and Delete Notes
- JWT authentication
- Responsive design for all devices
- Real-time updates

## Tech Stack 

### Frontend
- React.js

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication


## Getting Started

### Prerequisites

- Node.js software
- MongoDB Atlas account (you can also use local MongoDB)


### Installation

1. Clone repository:
```bash
git clone https://github.com/Abhishek-bramhawale/notes-mern-final.git
cd notes-mern-final
```

2. Install dependencies for client and server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret (any random 32 digit kwy)

```

4. Start the development servers:
```bash
# Start the backend server (from server directory)
npm start

# Start the frontend development server (from client directory)
npm start
```

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas 


## Contact

For any questions or suggestions, please feel free to reach out. abhishekbramhwale2@gmail.com
